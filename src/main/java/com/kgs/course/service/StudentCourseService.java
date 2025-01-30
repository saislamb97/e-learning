package com.learning.course.service;

import com.learning.course.model.CourseModel;
import com.learning.course.model.StudentCourseModel;
import com.learning.course.repository.CourseRepository;
import com.learning.course.repository.StudentCourseRepository;
import com.learning.user.model.UserModel;
import com.learning.user.model.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StudentCourseService {

    private final StudentCourseRepository studentCourseRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    /**
     * Enroll a student in a course.
     */
    @Transactional
    public void enrollStudent(Long courseId, Long studentId) {
        CourseModel course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        UserModel student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        StudentCourseModel studentCourse = StudentCourseModel.builder()
                .course(course)
                .student(student)
                .status(StudentCourseModel.StudentCourseStatus.OPEN_FOR_JOINING)
                .build();

        studentCourseRepository.save(studentCourse);
    }

    /**
     * Update the status of a student's course enrollment.
     */
    @Transactional
    public StudentCourseModel updateEnrollmentStatus(Long studentCourseId, StudentCourseModel.StudentCourseStatus status) {
        StudentCourseModel studentCourse = studentCourseRepository.findById(studentCourseId)
                .orElseThrow(() -> new IllegalArgumentException("Enrollment not found"));
        studentCourse.setStatus(status);
        if (status == StudentCourseModel.StudentCourseStatus.JOINED) {
            studentCourse.setJoinedAt(Instant.now());
        } else if (status == StudentCourseModel.StudentCourseStatus.COMPLETED) {
            studentCourse.setCompletedAt(Instant.now());
        }
        return studentCourseRepository.save(studentCourse);
    }

    /**
     * Get all enrollments for a specific course.
     */
    public List<StudentCourseModel> getEnrollmentsByCourse(Long courseId) {
        return studentCourseRepository.findByCourseId(courseId);
    }

    /**
     * Get paginated enrollments for a student.
     */
    public Page<StudentCourseModel> getPaginatedEnrollmentsByStudent(Long studentId, int page, int size, String sortBy, Sort.Direction direction) {
        PageRequest pageRequest = PageRequest.of(page - 1, size, Sort.by(direction, sortBy));
        return studentCourseRepository.findByStudentId(studentId, pageRequest);
    }

    /**
     * Get a specific enrollment by ID.
     */
    public Optional<StudentCourseModel> getEnrollmentById(Long id) {
        return studentCourseRepository.findById(id);
    }

    /**
     * Delete an enrollment by ID.
     */
    @Transactional
    public void deleteEnrollment(Long id) {
        studentCourseRepository.deleteById(id);
    }
}
