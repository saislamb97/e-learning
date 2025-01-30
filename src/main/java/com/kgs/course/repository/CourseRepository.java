package com.learning.course.repository;

import com.learning.course.model.CourseModel;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;

public interface CourseRepository extends JpaRepository<CourseModel, Long> {

    // Paginated query for courses created by a specific user
    Page<CourseModel> findByCreatorId(Long creatorId, PageRequest pageRequest);

    Page<CourseModel> findByCourseStatus(CourseModel.CourseStatus status, PageRequest pageRequest);

    Page<CourseModel> findByCourseType(CourseModel.CourseType type, PageRequest pageRequest);

    List<CourseModel> findByCourseStatus(CourseModel.CourseStatus status);

    // Paginated query for courses by category
    Page<CourseModel> findByCategory(CourseModel.CourseCategory category, PageRequest pageRequest);

    @Query("SELECT c FROM CourseModel c " + "WHERE c.dateTime BETWEEN :startOfMonth AND :endOfMonth")
    List<CourseModel> findCoursesInMonth(
            @Param("startOfMonth") Instant startOfMonth,
            @Param("endOfMonth") Instant endOfMonth);

    // Query to get the top 5 categories with the most courses
    @Query("SELECT c.category, COUNT(c) AS categoryCount " +
            "FROM CourseModel c " +
            "GROUP BY c.category " +
            "ORDER BY categoryCount DESC")
    List<Object[]> findTop5Categories();

    // Query to calculate total hours studied (sum of durations) by a specific user
    @Query("SELECT COALESCE(SUM(c.duration), 0) FROM CourseModel c WHERE c.creator.id = :userId")
    int calculateTotalHoursStudied(@Param("userId") Long userId);

    // Query to count courses by status for a specific user
    @Query("SELECT COUNT(c) FROM CourseModel c WHERE c.creator.id = :userId AND c.courseStatus = :status")
    int countCoursesByUserAndStatus(@Param("userId") Long userId, @Param("status") CourseModel.CourseStatus status);

    @Query("""
        SELECT DISTINCT c
        FROM CourseModel c
        LEFT JOIN StudentCourseModel sc ON sc.course.id = c.id
        LEFT JOIN sc.student s
        WHERE\s
            c.creator.id = :userId
            OR c.instructor.id = :userId
            OR s.id = :userId
            OR (
                c.courseType = 'GROUP'
                AND (
                    (SELECT COUNT(sc1.id) FROM StudentCourseModel sc1 WHERE sc1.course.id = c.id) < c.maxStudents
                )
            )
            OR (
                c.courseType = 'INDIVIDUAL'
                AND c.creator.userRole = 'INSTRUCTOR'
                AND (SELECT COUNT(sc2.id) FROM StudentCourseModel sc2 WHERE sc2.course.id = c.id) = 0
            )
   \s""")
    Page<CourseModel> findAllRelatedOrUnfilledInstructorCourses(
            @Param("userId") Long userId,
            Pageable pageable
    );
}
