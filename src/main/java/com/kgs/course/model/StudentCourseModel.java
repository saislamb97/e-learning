package com.learning.course.model;

import com.learning.user.model.UserModel;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "student_courses")
public class StudentCourseModel {

    public enum StudentCourseStatus {
        WAITING_FOR_CONFIRMATION, OPEN_FOR_JOINING, JOINED, COMPLETED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private CourseModel course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private UserModel student;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StudentCourseStatus status = StudentCourseStatus.WAITING_FOR_CONFIRMATION;

    @Column(name = "joined_at")
    private Instant joinedAt;

    @Column(name = "completed_at")
    private Instant completedAt;
}

