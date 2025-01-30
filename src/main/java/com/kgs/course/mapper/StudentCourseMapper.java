package com.learning.course.mapper;

import com.learning.course.dto.CourseDto;
import com.learning.course.dto.StudentCourseDto;
import com.learning.course.model.StudentCourseModel;
import com.learning.user.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Component
@RequiredArgsConstructor
public class StudentCourseMapper {

    // Map StudentCourseModel to StudentCourseResponseDto
    public StudentCourseDto.StudentCourseResponseDto toStudentCourseResponseDto(StudentCourseModel studentCourse) {
        return StudentCourseDto.StudentCourseResponseDto.builder()
                .id(studentCourse.getId())
                .courseId(studentCourse.getCourse().getId())
                .studentId(studentCourse.getStudent().getId())
                .status(studentCourse.getStatus())
                .joinedAt(studentCourse.getJoinedAt())
                .completedAt(studentCourse.getCompletedAt())
                .build();
    }

    // Map CreateStudentCourseRequestDto to StudentCourseModel
    public StudentCourseModel toStudentCourseModel(
            StudentCourseDto.CreateStudentCourseRequestDto requestDto,
            StudentCourseModel.StudentCourseStatus initialStatus
    ) {
        return StudentCourseModel.builder()
                .status(initialStatus)
                .build();
    }

    // Update StudentCourseModel from UpdateStudentCourseStatusRequestDto
    public StudentCourseModel toStudentCourseModel(
            StudentCourseModel studentCourse,
            StudentCourseDto.UpdateStudentCourseStatusRequestDto requestDto
    ) {
        if (requestDto.getStatus() != null) {
            studentCourse.setStatus(requestDto.getStatus());
        }
        return studentCourse;
    }

    // Map List<StudentCourseModel> to List<StudentCourseResponseDto>
    public List<StudentCourseDto.StudentCourseResponseDto> toStudentCourseResponseDtoList(List<StudentCourseModel> studentCourses) {
        if (studentCourses == null) {
            return Collections.emptyList(); // Return an empty list if studentCourses is null
        }
        return studentCourses.stream()
                .filter(Objects::nonNull) // Filter out any null elements in the list
                .map(this::toStudentCourseResponseDto)
                .toList();
    }
}
