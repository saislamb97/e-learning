package com.learning.course.dto;

import com.learning.course.model.CourseModel;
import com.learning.course.model.StudentCourseModel;
import com.learning.user.model.UserDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

public class StudentCourseDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentCourseResponseDto {
        private Long id;
        private Long courseId;
        private Long studentId;
        private StudentCourseModel.StudentCourseStatus status;
        private Instant joinedAt;
        private Instant completedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateStudentCourseRequestDto {
        private Long courseId;
        private Long studentId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateStudentCourseStatusRequestDto {
        private StudentCourseModel.StudentCourseStatus status;
    }
}
