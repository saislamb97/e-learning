package com.learning.user.model;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserSeed implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        createUserIfNotExists("admin", "Admin", "admin@learning.com", "adminpassword", UserModel.UserRole.ADMIN);
        createUserIfNotExists("instructor", "Instructor", "instructor@learning.com.my", "instructorpassword", UserModel.UserRole.INSTRUCTOR);
        createUserIfNotExists("student", "Student", "student@learning.com.my", "studentpassword", UserModel.UserRole.STUDENT);
    }

    private void createUserIfNotExists(String username, String fullName, String email, String password, UserModel.UserRole userRole) {
        if (!userRepository.existsByEmail(email)) {
            UserModel user = UserModel.builder()
                    .username(username)
                    .fullName(fullName)
                    .email(email)
                    .password(passwordEncoder.encode(password))
                    .phone("1234567890")
                    .gender(UserModel.GenderType.MALE)
                    .userRole(userRole)
                    .userStatus(UserModel.UserStatus.VERIFIED)
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();

            userRepository.save(user);
            log.info("User created: {}", email);
        }
    }
}
