package com.learning.course;

import com.learning.auth.JwtService;
import com.learning.course.mapper.CourseMapper;
import com.learning.course.dto.CourseDto;
import com.learning.course.model.CourseModel;
import com.learning.course.model.StudentCourseModel;
import com.learning.course.service.CourseService;
import com.learning.course.service.StudentCourseService;
import com.learning.user.UserService;
import com.learning.user.model.UserModel;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseApi {

    private final CourseService courseService;
    private final UserService userService;
    private final JwtService jwtService;
    private final CourseMapper courseMapper;
    private final StudentCourseService studentCourseService;

    @Operation(summary = "Create a new course.")
    @PostMapping
    public ResponseEntity<CourseDto.CourseResponseDto> createCourse(
            @RequestHeader("X-Timestamp") String timestamp,
            @RequestBody CourseDto.CourseRequestDto courseRequestDto) {
        Long creatorId = jwtService.extractLoggedInUserId();
        UserModel creator = userService.getUserById(creatorId)
                .orElseThrow(() -> new IllegalArgumentException("Creator not found"));

        if (creator.getUserRole() == UserModel.UserRole.STUDENT && courseRequestDto.getCourseType() == CourseModel.CourseType.GROUP) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(null); // Students can only create individual courses.
        }

        CourseModel course = courseMapper.toCourseModel(courseRequestDto, creator);
        CourseModel savedCourse = courseService.saveCourse(course);
        return ResponseEntity.status(HttpStatus.CREATED).body(courseMapper.toCourseResponseDto(savedCourse));
    }

    @Operation(summary = "Update an existing course.")
    @PutMapping("/{id}")
    public ResponseEntity<CourseDto.CourseResponseDto> updateCourse(
            @RequestHeader("X-Timestamp") String timestamp,
            @PathVariable Long id,
            @RequestBody CourseDto.CourseRequestDto courseRequestDto) {
        CourseModel existingCourse = courseService.getCourseById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        Long loggedInUserId = jwtService.extractLoggedInUserId();
        if (!existingCourse.getCreator().getId().equals(loggedInUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(null); // Only the creator can update the course.
        }

        CourseModel updatedCourse = courseMapper.toCourseModel(existingCourse, courseRequestDto);
        CourseModel savedCourse = courseService.saveCourse(updatedCourse);
        return ResponseEntity.ok(courseMapper.toCourseResponseDto(savedCourse));
    }

    @Operation(summary = "Delete a course.")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(
            @RequestHeader("X-Timestamp") String timestamp,
            @PathVariable Long id) {
        CourseModel existingCourse = courseService.getCourseById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        Long loggedInUserId = jwtService.extractLoggedInUserId();
        if (!existingCourse.getCreator().getId().equals(loggedInUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You are not authorized to delete this course.");
        }

        courseService.deleteCourse(id);
        return ResponseEntity.ok("Course deleted successfully.");
    }

    @Operation(summary = "Cancel a course or detach a user from it.")
    @DeleteMapping("/{id}/cancel")
    public ResponseEntity<?> cancelCourseOrDetachUser(
            @RequestHeader("X-Timestamp") String timestamp,
            @PathVariable Long id) {
        try {
            // Extract the ID of the logged-in user
            Long loggedInUserId = jwtService.extractLoggedInUserId();

            // Fetch the user and the course
            UserModel loggedInUser = userService.getUserById(loggedInUserId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            CourseModel course = courseService.getCourseById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Course not found"));

            // If the logged-in user is the creator or an admin
            if (course.getCreator().getId().equals(loggedInUserId) || loggedInUser.getUserRole() == UserModel.UserRole.ADMIN) {
                // Remove all students from the course
                for (StudentCourseModel studentCourse : course.getStudentCourses()) {
                    studentCourseService.deleteEnrollment(studentCourse.getId()); // Delete each enrollment record
                }
                course.getStudentCourses().clear(); // Clear the list in memory

                // Set course status to CANCELLED
                course.setCourseStatus(CourseModel.CourseStatus.CANCELLED);
                courseService.saveCourse(course);
                return ResponseEntity.ok("The course and all associated students have been removed successfully.");
            } else {
                // Check if the logged-in user is a student of the course
                Optional<StudentCourseModel> studentCourse = course.getStudentCourses().stream()
                        .filter(sc -> sc.getStudent().getId().equals(loggedInUserId))
                        .findFirst();

                // Remove the student from the course
                if (studentCourse.isPresent()) {
                    studentCourseService.deleteEnrollment(studentCourse.get().getId()); // Delete the enrollment record
                    course.getStudentCourses().remove(studentCourse.get()); // Ensure it's removed from memory
                    courseService.saveCourse(course); // Persist changes to the course
                    return ResponseEntity.ok("You have been removed from the course.");
                }

                // Check if the user is the instructor and detach if necessary
                if (course.getInstructor() != null && course.getInstructor().getId().equals(loggedInUserId)) {
                    course.setInstructor(null);
                    courseService.saveCourse(course);
                    return ResponseEntity.ok("You have been detached from the course.");
                }

                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("You are not associated with this course.");
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }

    @Operation(summary = "Get a course by ID.")
    @GetMapping("/{id}")
    public ResponseEntity<CourseDto.CourseResponseDto> getCourseById(
            @RequestHeader("X-Timestamp") String timestamp,
            @PathVariable Long id) {
        CourseModel course = courseService.getCourseById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        Long userId = jwtService.extractLoggedInUserId();

        CourseDto.CourseResponseDto courseResponseDto = courseMapper.toCourseResponseDto(course);
        courseResponseDto.setCurrentUserId(userId);

        return ResponseEntity.ok(courseResponseDto);
    }

    @Operation(summary = "Get courses created by the logged-in user with pagination.")
    @GetMapping("/my-courses")
    public ResponseEntity<Map<String, Object>> getCoursesByCreator(
            @RequestHeader("X-Timestamp") String timestamp,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {
        try {
            // Extract logged-in user's ID
            Long creatorId = jwtService.extractLoggedInUserId();

            // Fetch paginated courses by creator
            Page<CourseModel> coursesPage = courseService.getCoursesByCreator(creatorId, page, size, sortBy, direction);

            // Map the CourseModel list to CourseResponseDto list
            List<CourseDto.CourseResponseDto> courses = courseMapper.toCourseResponseDtoList(coursesPage.getContent());

            // Set the current user's ID for each course response DTO
            courses.forEach(courseResponseDto -> courseResponseDto.setCurrentUserId(creatorId));

            // Prepare response with pagination metadata
            Map<String, Object> response = Map.of(
                    "courses", courses,
                    "currentPage", coursesPage.getNumber() + 1,
                    "totalPages", coursesPage.getTotalPages()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Get live courses open for joining and currently live.")
    @GetMapping("/live-courses")
    public ResponseEntity<List<CourseDto.CourseResponseDto>> getLiveCourses(
            @RequestHeader("X-Timestamp") String timestamp,
            @RequestParam("currentTime") String currentTime) {
        Instant now = Instant.parse(currentTime);
        // Fetch courses with status OPEN_FOR_JOINING
        List<CourseModel> courses = courseService.getCoursesByStatus(CourseModel.CourseStatus.OPEN_FOR_JOINING);

        // Filter courses where the current time is within the course's active period
//        List<CourseModel> liveCourses = courses.stream()
//                .filter(course -> course.getDateTime().isBefore(now) &&
//                        now.isBefore(course.getDateTime().plusSeconds(course.getDuration() * 60)))
//                .collect(Collectors.toList());

        Long userId = jwtService.extractLoggedInUserId();
        List<CourseDto.CourseResponseDto> responseDtos = courseMapper.toCourseResponseDtoList(courses);
        responseDtos.forEach(dto -> dto.setCurrentUserId(userId));
        return ResponseEntity.ok(responseDtos);
    }

    // CourseApi.java
    @Operation(summary = "Get courses user is involved in or empty INDIVIDUAL from instructor, plus all GROUP courses.")
    @GetMapping("/my-related-courses")
    public ResponseEntity<Map<String, Object>> getMyRelatedCourses(
            @RequestHeader("X-Timestamp") String timestamp,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction
    ) {
        try {
            // 1) Current user's ID from JWT
            Long userId = jwtService.extractLoggedInUserId();

            // 2) Retrieve the page from service
            Page<CourseModel> coursesPage = courseService.getRelatedOrEmptyInstructorCourses(
                    userId, page, size, sortBy, direction
            );

            if (coursesPage.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            // 3) Map the CourseModel list to CourseResponseDto
            List<CourseDto.CourseResponseDto> coursesDto = courseMapper.toCourseResponseDtoList(
                    coursesPage.getContent()
            );

            // Set the current user's ID for each course response DTO
            coursesDto.forEach(courseResponseDto -> courseResponseDto.setCurrentUserId(userId));

            // 4) Return paginated structure
            Map<String, Object> response = Map.of(
                    "courses", coursesDto,
                    "currentPage", coursesPage.getNumber() + 1,
                    "totalPages", coursesPage.getTotalPages()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Get courses by category with pagination.")
    @GetMapping("/category/{category}")
    public ResponseEntity<Map<String, Object>> getCoursesByCategory(
            @RequestHeader(value = "X-Timestamp", required = true) String timestamp,
            @PathVariable("category") CourseModel.CourseCategory category,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {
        try {

            Long userId = jwtService.extractLoggedInUserId();

            // Fetch courses by category with pagination
            Page<CourseModel> coursesPage = courseService.getCoursesByCategory(category, page, size, sortBy, direction);

            // Map the CourseModel list to CourseResponseDto list
            List<CourseDto.CourseResponseDto> courses = courseMapper.toCourseResponseDtoList(coursesPage.getContent());

            // Set the current user's ID for each course response DTO
            courses.forEach(courseResponseDto -> courseResponseDto.setCurrentUserId(userId));

            // Prepare response with pagination metadata
            Map<String, Object> response = Map.of(
                    "courses", courses,
                    "currentPage", coursesPage.getNumber() + 1,
                    "totalPages", coursesPage.getTotalPages()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @Operation(summary = "Get all courses with pagination.")
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllCourses(
            @RequestHeader("X-Timestamp") String timestamp,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {

        Long userId = jwtService.extractLoggedInUserId();

        Page<CourseModel> coursesPage = courseService.getAllCourses(page, size, sortBy, direction);
        List<CourseDto.CourseResponseDto> courses = courseMapper.toCourseResponseDtoList(coursesPage.getContent());

        // Set the current user's ID for each course response DTO
        courses.forEach(courseResponseDto -> courseResponseDto.setCurrentUserId(userId));

        return ResponseEntity.ok(Map.of(
                "courses", courses,
                "currentPage", coursesPage.getNumber() + 1,
                "totalPages", coursesPage.getTotalPages()
        ));
    }

    @Operation(summary = "Join a course.")
    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinCourse(
            @RequestHeader("X-Timestamp") String timestamp,
            @PathVariable Long id) {
        try {
            Long userId = jwtService.extractLoggedInUserId();
            UserModel student = userService.getUserById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            CourseModel course = courseService.getCourseById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Course not found"));

            // Check if the course is open for joining
            if (course.getCourseStatus() != CourseModel.CourseStatus.WAITING_FOR_CONFIRMATION) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Course is not open for joining.");
            }

            // Check if the course is full
            if (course.getStudentCourses().size() >= course.getMaxStudents()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("The course is full and cannot accept more students.");
            }

            // Check if the student is already enrolled in the course
            boolean alreadyEnrolled = course.getStudentCourses().stream()
                    .anyMatch(sc -> sc.getStudent().getId().equals(userId));

            if (alreadyEnrolled) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("You are already enrolled in this course.");
            }

            // Create a new StudentCourseModel entry for the student
            StudentCourseModel studentCourse = StudentCourseModel.builder()
                    .course(course)
                    .student(student)
                    .status(StudentCourseModel.StudentCourseStatus.OPEN_FOR_JOINING)
                    .joinedAt(Instant.now())
                    .build();

            course.getStudentCourses().add(studentCourse);
            course.setCourseStatus(CourseModel.CourseStatus.OPEN_FOR_JOINING);
            courseService.saveCourse(course);

            return ResponseEntity.ok("You have successfully joined the course.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred: " + e.getMessage());
        }
    }

    @Operation(summary = "Get courses filtered by type with pagination.")
    @GetMapping("/type/{type}")
    public ResponseEntity<Map<String, Object>> getCoursesByType(
            @RequestHeader("X-Timestamp") String timestamp,
            @PathVariable CourseModel.CourseType type,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {
        try {
            Page<CourseModel> coursesPage = courseService.getCoursesByType(type, page, size, sortBy, direction);

            if (coursesPage.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            List<CourseDto.CourseResponseDto> courseDtos = courseMapper.toCourseResponseDtoList(coursesPage.getContent());

            Long userId = jwtService.extractLoggedInUserId();

            // Set the current user's ID for each course response DTO
            courseDtos.forEach(courseResponseDto -> courseResponseDto.setCurrentUserId(userId));

            return ResponseEntity.ok(Map.of(
                    "courses", courseDtos,
                    "currentPage", coursesPage.getNumber() + 1,
                    "totalPages", coursesPage.getTotalPages()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }

    @Operation(summary = "Get courses filtered by status with pagination.")
    @GetMapping("/status/{status}")
    public ResponseEntity<Map<String, Object>> getCoursesByStatus(
            @RequestHeader("X-Timestamp") String timestamp,
            @PathVariable CourseModel.CourseStatus status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {
        try {
            Page<CourseModel> coursesPage = courseService.getCoursesByStatus(status, page, size, sortBy, direction);

            if (coursesPage.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            List<CourseDto.CourseResponseDto> courseDtos = courseMapper.toCourseResponseDtoList(coursesPage.getContent());

            Long userId = jwtService.extractLoggedInUserId();

            // Set the current user's ID for each course response DTO
            courseDtos.forEach(courseResponseDto -> courseResponseDto.setCurrentUserId(userId));

            return ResponseEntity.ok(Map.of(
                    "courses", courseDtos,
                    "currentPage", coursesPage.getNumber() + 1,
                    "totalPages", coursesPage.getTotalPages()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }

    @Operation(summary = "Get courses in the specified month.")
    @GetMapping("/month-courses")
    public ResponseEntity<Map<String, Object>> getCoursesForMonth(
            @RequestHeader("X-Timestamp") String timestamp,
            @RequestParam("year") int year,
            @RequestParam("month") int month) {
        try {
            // Calculate the start and end of the month
            Instant startOfMonth = Instant.parse(String.format("%04d-%02d-01T00:00:00Z", year, month));
            Instant endOfMonth = startOfMonth.plusSeconds(31L * 24 * 60 * 60).minusSeconds(1);

            // Fetch courses without pagination
            List<CourseModel> courses = courseService.getCoursesInMonth(startOfMonth, endOfMonth);
            List<CourseDto.CourseResponseDto> courseDtos = courseMapper.toCourseResponseDtoList(courses);

            Long userId = jwtService.extractLoggedInUserId();

            // Set the current user's ID for each course response DTO
            courseDtos.forEach(courseResponseDto -> courseResponseDto.setCurrentUserId(userId));

            return ResponseEntity.ok(Map.of(
                    "courses", courseDtos,
                    "month", month,
                    "year", year
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }

    @Operation(summary = "Get top 5 most popular course categories.")
    @GetMapping("/categories/top-5")
    public ResponseEntity<List<Map<String, Object>>> getTop5Categories(
            @RequestHeader("X-Timestamp") String timestamp) {
        try {
            // Fetch the top 5 categories from the service
            List<Object[]> topCategories = courseService.getTop5Categories();

            // Format the response as a list of maps
            List<Map<String, Object>> response = topCategories.stream()
                    .map(category -> Map.of(
                            "category", category[0],
                            "count", category[1]
                    ))
                    .toList();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @Operation(summary = "Get overview summary for the logged-in user.")
    @GetMapping("/overview-summary")
    public ResponseEntity<Map<String, Object>> getOverviewSummary(
            @RequestHeader("X-Timestamp") String timestamp) {
        try {
            Long userId = jwtService.extractLoggedInUserId();

            // Fetch data from the service layer
            Map<String, Object> stats = courseService.getOverviewSummary(userId);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
