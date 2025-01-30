package com.learning.course.repository;

import com.learning.course.model.StudentCourseModel;
import com.learning.course.model.StudentCourseModel.StudentCourseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StudentCourseRepository extends JpaRepository<StudentCourseModel, Long> {
    boolean existsByCourseIdAndStudentId(Long courseId, Long studentId);

    List<StudentCourseModel> findByCourseId(Long courseId);

    Page<StudentCourseModel> findByStudentId(Long studentId, PageRequest pageRequest);
}