package com.learning.auth;

import com.learning.user.UserService;
import com.learning.user.model.UserDto;
import com.learning.user.model.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auths")
@RequiredArgsConstructor
public class AuthApi {

    private final JwtAuthService jwtAuthService;
    private final UserRepository userRepository;

    @Operation(summary = "Register a new user.")
    @PostMapping("/signup")
    public ResponseEntity<UserDto.JwtAuthDTO> registerUser(
            @RequestHeader(value = "X-Timestamp", required = true) String timestamp,
            @Valid @RequestBody UserDto.SignupDto signupDto) {
        try {
            // Check if username or email already exists
            if (userRepository.existsByUsername(signupDto.getUsername())) {
                throw new UserValidation.UsernameAlreadyExists("Username is already taken");
            }
            if (userRepository.existsByEmail(signupDto.getEmail())) {
                throw new UserValidation.EmailAlreadyExists("Email is already taken");
            }
            if (UserValidation.isValidEmail(signupDto.getEmail())) {
                throw new UserValidation.InvalidEmailFormat("Invalid email format");
            }
            if (UserValidation.isValidPassword(signupDto.getPassword())) {
                throw new UserValidation.InvalidPasswordFormat("Invalid password format. Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one digit.");
            }

            UserDto.JwtAuthDTO jwtAuthResponse = jwtAuthService.signup(signupDto, timestamp);

            return ResponseEntity.ok(jwtAuthResponse);
        } catch (UserValidation.UsernameAlreadyExists |
                 UserValidation.EmailAlreadyExists |
                 UserValidation.InvalidEmailFormat |
                 UserValidation.InvalidPasswordFormat e) {
            UserDto.JwtAuthDTO errorResponse = UserDto.JwtAuthDTO.builder().message(e.getMessage()).build();
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
        }
    }

    @Operation(summary = "Log in a user.")
    @PostMapping("/login")
    public ResponseEntity<UserDto.JwtAuthDTO> loginUser(
            @RequestHeader(value = "X-Timestamp", required = true) String timestamp,
            @Valid @RequestBody UserDto.LoginDto loginDto) {
        try {
            UserDto.JwtAuthDTO jwtAuthResponse = jwtAuthService.login(loginDto, timestamp);
            return ResponseEntity.ok(jwtAuthResponse);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(UserDto.JwtAuthDTO.builder()
                            .message("Invalid email or password.")
                            .build());
        }
    }
}
