package com.learning.course.model;

import com.learning.user.model.UserModel;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "courses")
public class CourseModel {

    public enum CourseType {
        INDIVIDUAL, GROUP
    }

    public enum CourseStatus {
        SCHEDULED, OPEN_FOR_JOINING, WAITING_FOR_CONFIRMATION, COMPLETED, CANCELLED
    }

    public enum CourseCategory {
        MATHEMATICS, SCIENCE, LANGUAGE, ARTS, TECHNOLOGY, BUSINESS, HISTORY, LITERATURE, PHYSICS, CHEMISTRY, BIOLOGY
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CourseType courseType = CourseType.INDIVIDUAL;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CourseStatus courseStatus = CourseStatus.WAITING_FOR_CONFIRMATION;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CourseCategory category;

    @Column(nullable = false)
    private Instant dateTime;

    @Column(nullable = false)
    private Integer duration; // Duration of the course in minutes

    @Column(nullable = false)
    private Double cost;

    @Column(nullable = false)
    @Builder.Default
    private Integer maxStudents = 1;

    // The creator of the course (can be either an instructor or a student)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private UserModel creator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id")
    private UserModel instructor;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<StudentCourseModel> studentCourses = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        // Ensure defaults are applied if fields are null
        if (this.maxStudents == null) {
            this.maxStudents = 1;
        }
        if (this.courseType == null) {
            this.courseType = CourseType.INDIVIDUAL;
        }
        if (this.courseStatus == null) {
            this.courseStatus = CourseStatus.WAITING_FOR_CONFIRMATION;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
