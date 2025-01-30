package com.learning.user.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

public class UserDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserResponseDto {
        private Long userId;
        private String username;
        private String fullName;
        private String email;
        private String phone;
        private UserModel.GenderType gender;
        private UserModel.UserRole userRole;
        private UserModel.UserStatus userStatus;
        private Instant createdAt;
        private Instant updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserRequestDto {
        private String username;
        private String fullName;
        private String email;
        private String password;
        private String phone;
        private UserModel.GenderType gender;
        private UserModel.UserRole userRole;
        private UserModel.UserStatus userStatus;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginDto {
        private String email;
        private String password;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SignupDto {
        private String username;
        private String email;
        private String password;
        private UserModel.UserRole userRole;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JwtAuthDTO {
        String token;
        String email;
        UserModel.UserRole userRole;
        private UserModel.UserStatus userStatus;
        String message;
    }
}
