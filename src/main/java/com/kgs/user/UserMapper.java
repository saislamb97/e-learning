package com.learning.user;

import com.learning.user.model.UserDto;
import com.learning.user.model.UserModel;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Component
@RequiredArgsConstructor
public class UserMapper {

    private final PasswordEncoder passwordEncoder;

    public UserDto.UserResponseDto toUserResponseDto(UserModel user) {
        return UserDto.UserResponseDto.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .gender(user.getGender())
                .userRole(user.getUserRole())
                .userStatus(user.getUserStatus())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    public UserModel toUserModel(UserDto.UserRequestDto userDto) {
        return UserModel.builder()
                .username(userDto.getUsername())
                .fullName(userDto.getFullName())
                .email(userDto.getEmail())
                .password(passwordEncoder.encode(userDto.getPassword()))
                .phone(userDto.getPhone())
                .gender(userDto.getGender())
                .userRole(userDto.getUserRole())
                .userStatus(userDto.getUserStatus())
                .build();
    }

    public UserModel toUserModel(UserModel user, UserDto.UserRequestDto userDto) {
        if (userDto.getUsername() != null) {
            user.setUsername(userDto.getUsername());
        }
        if (userDto.getFullName() != null) {
            user.setFullName(userDto.getFullName());
        }
        if (userDto.getEmail() != null) {
            user.setEmail(userDto.getEmail());
        }
        if (userDto.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        }
        if (userDto.getPhone() != null) {
            user.setPhone(userDto.getPhone());
        }
        if (userDto.getGender() != null) {
            user.setGender(userDto.getGender());
        }
        if (userDto.getUserRole() != null) {
            user.setUserRole(userDto.getUserRole());
        }
        if (userDto.getUserStatus() != null) {
            user.setUserStatus(userDto.getUserStatus());
        }
        return user;
    }

    public List<UserDto.UserResponseDto> toUserResponseDtoList(List<UserModel> users) {
        if (users == null) {
            return Collections.emptyList(); // Return an empty list if users is null
        }
        return users.stream()
                .filter(Objects::nonNull) // Filter out any null elements in the list
                .map(this::toUserResponseDto)
                .toList();
    }
}
