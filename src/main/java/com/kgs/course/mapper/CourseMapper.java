package com.learning.course.mapper;

import com.learning.course.dto.CourseDto;
import com.learning.course.dto.StudentCourseDto;
import com.learning.course.model.CourseModel;
import com.learning.course.model.StudentCourseModel;
import com.learning.user.UserMapper;
import com.learning.user.model.UserModel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Component
@RequiredArgsConstructor
public class CourseMapper {

    private final UserMapper userMapper;
    private final StudentCourseMapper studentCourseMapper;

    // Map CourseModel to CourseResponseDto
    public CourseDto.CourseResponseDto toCourseResponseDto(CourseModel course) {
        return CourseDto.CourseResponseDto.builder()
                .courseId(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .courseType(course.getCourseType())
                .courseStatus(course.getCourseStatus())
                .category(course.getCategory())
                .dateTime(course.getDateTime())
                .duration(course.getDuration())
                .cost(course.getCost())
                .maxStudents(course.getMaxStudents())
                .creator(userMapper.toUserResponseDto(course.getCreator()))
                .instructor(course.getInstructor() != null ? userMapper.toUserResponseDto(course.getInstructor()) : null)
                .studentCourses(studentCourseMapper.toStudentCourseResponseDtoList(course.getStudentCourses()))
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .build();
    }

    // Map CourseRequestDto to CourseModel
    public CourseModel toCourseModel(CourseDto.CourseRequestDto courseDto, UserModel creator) {
        return CourseModel.builder()
                .title(courseDto.getTitle())
                .description(courseDto.getDescription())
                .courseType(courseDto.getCourseType())
                .courseStatus(courseDto.getCourseStatus())
                .category(courseDto.getCategory())
                .dateTime(courseDto.getDateTime())
                .duration(courseDto.getDuration())
                .cost(courseDto.getCost())
                .maxStudents(courseDto.getMaxStudents())
                .creator(creator)
                .build();
    }

    // Update existing CourseModel from CourseRequestDto
    public CourseModel toCourseModel(CourseModel course, CourseDto.CourseRequestDto courseDto) {
        if (courseDto.getTitle() != null) {
            course.setTitle(courseDto.getTitle());
        }
        if (courseDto.getDescription() != null) {
            course.setDescription(courseDto.getDescription());
        }
        if (courseDto.getCourseType() != null) {
            course.setCourseType(courseDto.getCourseType());
        }
        if (courseDto.getCourseStatus() != null) {
            course.setCourseStatus(courseDto.getCourseStatus());
        }
        if (courseDto.getCategory() != null) {
            course.setCategory(courseDto.getCategory());
        }
        if (courseDto.getDateTime() != null) {
            course.setDateTime(courseDto.getDateTime());
        }
        if (courseDto.getDuration() != null) {
            course.setDuration(courseDto.getDuration());
        }
        if (courseDto.getCost() != null) {
            course.setCost(courseDto.getCost());
        }
        if (courseDto.getMaxStudents() != null) {
            course.setMaxStudents(courseDto.getMaxStudents());
        }
        return course;
    }

    // Map List<CourseModel> to List<CourseResponseDto>
    public List<CourseDto.CourseResponseDto> toCourseResponseDtoList(List<CourseModel> courses) {
        if (courses == null) {
            return Collections.emptyList();
        }
        return courses.stream()
                .filter(Objects::nonNull)
                .map(this::toCourseResponseDto)
                .toList();
    }
}
