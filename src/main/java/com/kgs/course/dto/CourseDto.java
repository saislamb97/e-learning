package com.learning.course.dto;

import com.learning.course.model.CourseModel;
import com.learning.user.model.UserDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

public class CourseDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseResponseDto {
        private Long currentUserId;
        private Long courseId;
        private String title;
        private String description;
        private CourseModel.CourseType courseType;
        private CourseModel.CourseStatus courseStatus;
        private CourseModel.CourseCategory category;
        private Instant dateTime;
        private Integer duration;
        private Double cost;
        private Integer maxStudents;

        // Creator and Instructor information
        private UserDto.UserResponseDto creator;
        private UserDto.UserResponseDto instructor;

        // List of enrolled students
        private List<StudentCourseDto.StudentCourseResponseDto> studentCourses;

        private Instant createdAt;
        private Instant updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseRequestDto {
        private String title;
        private String description;
        private CourseModel.CourseType courseType;
        private CourseModel.CourseStatus courseStatus;
        private CourseModel.CourseCategory category;
        private Instant dateTime;
        private Integer duration;
        private Double cost;
        private Integer maxStudents;
        private Long creatorId;
    }
}
