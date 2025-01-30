package com.learning.auth;

import com.learning.user.model.UserDto;
import com.learning.user.model.UserModel;
import com.learning.user.model.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class JwtAuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public UserDto.JwtAuthDTO signup(UserDto.SignupDto request, String timestamp) {
        Instant instantTimestamp = Instant.parse(timestamp);
        UserModel user = createUser(request, instantTimestamp);
        String jwt = jwtService.generateToken(user);
        return buildJwtAuthResponse(user, jwt, "User Registered Successfully. Please check your email to verify your account.");
    }

    public UserDto.JwtAuthDTO login(UserDto.LoginDto request, String timestamp) {
        UserModel user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        return handleLogin(user, request, timestamp);
    }

    private UserModel createUser(UserDto.SignupDto request, Instant timestamp) {
        UserModel user = UserModel.builder()
                .username(request.getUsername())
                .fullName(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .userRole(UserModel.UserRole.STUDENT) // Default userRole if not provided in DTO
                .userStatus(UserModel.UserStatus.NOT_VERIFIED)
                .createdAt(timestamp)
                .updatedAt(timestamp)
                .build();
        userRepository.save(user);
        return user;
    }

    private UserDto.JwtAuthDTO handleLogin(UserModel user, UserDto.LoginDto request, String timestamp) {
        Instant instantTimestamp = Instant.parse(timestamp);
        String jwt = jwtService.generateToken(user);

        if (user.getUserStatus() == UserModel.UserStatus.NOT_VERIFIED) {
            user.setUpdatedAt(instantTimestamp);
            userRepository.save(user);
            return buildJwtAuthResponse(user, jwt, "Account not verified. Please check your email for the verification OTP.");
        }

        if (user.getUserStatus() == UserModel.UserStatus.INACTIVE) {
            return UserDto.JwtAuthDTO.builder()
                    .userStatus(user.getUserStatus())
                    .userRole(user.getUserRole())
                    .message("Your account couldn't be found, maybe it had been deleted or deactivated.")
                    .build();
        }

        if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return buildJwtAuthResponse(user, jwt, "User Logged in Successfully.");
        }

        throw new IllegalArgumentException("Invalid email or password.");
    }

    private UserDto.JwtAuthDTO buildJwtAuthResponse(UserModel user, String jwt, String message) {
        return UserDto.JwtAuthDTO.builder()
                .token(jwt)
                .email(user.getEmail())
                .userRole(user.getUserRole())
                .userStatus(user.getUserStatus())
                .message(message)
                .build();
    }
}
