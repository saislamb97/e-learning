package com.learning.course.service;

import com.learning.course.model.CourseModel;
import com.learning.course.repository.CourseRepository;
import com.learning.user.model.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    /**
     * Create a new course.
     */
    @Transactional
    public CourseModel saveCourse(CourseModel course) {
        return courseRepository.save(course);
    }

    public Page<CourseModel> getCoursesByStatus(CourseModel.CourseStatus status, int page, int size, String sortBy, Sort.Direction direction) {
        PageRequest pageRequest = PageRequest.of(page - 1, size, Sort.by(direction, sortBy));
        return courseRepository.findByCourseStatus(status, pageRequest);
    }

    public Page<CourseModel> getCoursesByType(CourseModel.CourseType type, int page, int size, String sortBy, Sort.Direction direction) {
        PageRequest pageRequest = PageRequest.of(page - 1, size, Sort.by(direction, sortBy));
        return courseRepository.findByCourseType(type, pageRequest);
    }

    public Page<CourseModel> getCoursesByCategory(CourseModel.CourseCategory category, int page, int size, String sortBy, Sort.Direction direction) {
        PageRequest pageRequest = PageRequest.of(page - 1, size, Sort.by(direction, sortBy));
        return courseRepository.findByCategory(category, pageRequest);
    }

    /**
     * Delete a course by ID.
     */
    @Transactional
    public void deleteCourse(Long courseId) {
        courseRepository.deleteById(courseId);
    }

    public List<CourseModel> getCoursesByStatus(CourseModel.CourseStatus status) {
        return courseRepository.findByCourseStatus(status);
    }

    /**
     * Get a course by ID.
     */
    public Optional<CourseModel> getCourseById(Long courseId) {
        return courseRepository.findById(courseId);
    }

    /**
     * Get all courses with pagination and sorting.
     */
    public Page<CourseModel> getAllCourses(int page, int size, String sortBy, Sort.Direction direction) {
        PageRequest pageRequest = PageRequest.of(page - 1, size, Sort.by(direction, sortBy));
        return courseRepository.findAll(pageRequest);
    }

    public List<CourseModel> getCoursesInMonth(Instant startOfMonth, Instant endOfMonth) {
        return courseRepository.findCoursesInMonth(startOfMonth, endOfMonth);
    }

    public Page<CourseModel> getCoursesByCreator(Long creatorId, int page, int size, String sortBy, Sort.Direction direction) {
        PageRequest pageRequest = PageRequest.of(page - 1, size, Sort.by(direction, sortBy));
        return courseRepository.findByCreatorId(creatorId, pageRequest);
    }

    public List<Object[]> getTop5Categories() {
        return courseRepository.findTop5Categories();
    }

    public Page<CourseModel> getRelatedOrEmptyInstructorCourses(
            Long userId, int page, int size, String sortBy, Sort.Direction direction
    ) {
        // Page is 1-based from the request, so subtract 1 for zero-based PageRequest
        PageRequest pageable = PageRequest.of(page - 1, size, direction, sortBy);
        return courseRepository.findAllRelatedOrUnfilledInstructorCourses(userId, pageable);
    }

    public Map<String, Object> getOverviewSummary(Long userId) {
        int totalHoursStudied = courseRepository.calculateTotalHoursStudied(userId);
        int coursesCanceled = courseRepository.countCoursesByUserAndStatus(userId, CourseModel.CourseStatus.CANCELLED);
        int completedCourses = courseRepository.countCoursesByUserAndStatus(userId, CourseModel.CourseStatus.COMPLETED);
        int pendingRequests = courseRepository.countCoursesByUserAndStatus(userId, CourseModel.CourseStatus.WAITING_FOR_CONFIRMATION);

        return Map.of(
                "totalHoursStudied", Map.of(
                        "value", totalHoursStudied,
                        "unit", "Hours",
                        "change", "+2.5%" // Static or dynamic based on additional logic
                ),
                "coursesCanceled", Map.of(
                        "value", coursesCanceled,
                        "unit", "Courses",
                        "change", "-1.2%"
                ),
                "completedCourses", Map.of(
                        "value", completedCourses,
                        "unit", "Courses",
                        "change", "+11%"
                ),
                "pendingRequests", Map.of(
                        "value", pendingRequests,
                        "unit", "Requests",
                        "change", "+5.2%"
                )
        );
    }
}