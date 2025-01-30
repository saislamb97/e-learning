package com.learning.user;

import com.learning.auth.JwtService;
import com.learning.auth.UserValidation;
import com.learning.user.model.UserDto;
import com.learning.user.model.UserModel;
import com.learning.user.model.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserApi {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final UserService userService;
    private final JwtService jwtService;

    @Operation(summary = "Retrieve the profile of the logged-in user.")
    @GetMapping("/profile")
    public ResponseEntity<UserDto.UserResponseDto> getUserByName(
            @RequestHeader(value = "X-Timestamp", required = true) String timestamp) {
        try {
            Long loggedInUserId = jwtService.extractLoggedInUserId();
            Optional<UserModel> optionalUser = userRepository.findById(loggedInUserId);
            if (optionalUser.isPresent()) {
                UserModel user = optionalUser.get();
                UserDto.UserResponseDto userDto = userMapper.toUserResponseDto(user);
                return ResponseEntity.ok(userDto);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Retrieve a user's details by their unique ID.")
    @GetMapping("/{id}")
    public ResponseEntity<UserDto.UserResponseDto> getUserById(
            @RequestHeader(value = "X-Timestamp", required = true) String timestamp,
            @PathVariable Long id) {
        Optional<UserModel> userOptional = userService.getUserById(id);
        if (userOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        UserDto.UserResponseDto userDto = userMapper.toUserResponseDto(userOptional.get());
        return ResponseEntity.ok(userDto);
    }

    @Operation(summary = "List all users with pagination, sorting, and optional filters.")
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllUsers(
            @RequestHeader(value = "X-Timestamp", required = true) String timestamp,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction) {
        try {
            Page<UserModel> usersPage = userService.getAllUsers(page, limit, sortBy, direction);
            List<UserDto.UserResponseDto> userDtos = userMapper.toUserResponseDtoList(usersPage.getContent());
            Map<String, Object> response = new HashMap<>();
            response.put("users", userDtos);
            response.put("currentPage", usersPage.getNumber() + 1);
            response.put("totalPages", usersPage.getTotalPages());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @Operation(summary = "Create a new user in the system.")
    @PostMapping
    public ResponseEntity<UserDto.UserResponseDto> createUser(
            @RequestHeader(value = "X-Timestamp", required = true) String timestamp,
            @RequestBody UserDto.UserRequestDto userDto) {
        try {
            if (userRepository.existsByEmail(userDto.getEmail())) {
                throw new UserValidation.EmailAlreadyExists("Email is already taken");
            }
            if (!UserValidation.isValidEmail(userDto.getEmail())) {
                throw new UserValidation.InvalidEmailFormat("Invalid email format");
            }
            if (!UserValidation.isValidPassword(userDto.getPassword())) {
                throw new UserValidation.InvalidPasswordFormat("Invalid password format.");
            }
            UserModel newUser = userMapper.toUserModel(userDto);
            Instant instantTimestamp = Instant.parse(timestamp);
            newUser.setCreatedAt(instantTimestamp);
            newUser.setUpdatedAt(instantTimestamp);
            UserModel savedUser = userService.saveUser(newUser);
            UserDto.UserResponseDto createdUserDto = userMapper.toUserResponseDto(savedUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUserDto);
        } catch (UserValidation.EmailAlreadyExists |
                 UserValidation.InvalidEmailFormat |
                 UserValidation.InvalidPasswordFormat e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @Operation(summary = "Update the details of an existing user by their ID.")
    @PutMapping("/{id}")
    public ResponseEntity<UserDto.UserResponseDto> updateUser(
            @RequestHeader(value = "X-Timestamp", required = true) String timestamp,
            @PathVariable Long id,
            @RequestBody UserDto.UserRequestDto userDto) {
        try {
            UserModel existingUser = userRepository.findById(id).orElse(null);
            if (existingUser == null) {
                return ResponseEntity.notFound().build();
            }
            if (!existingUser.getUsername().equals(userDto.getUsername()) &&
                    userRepository.existsByUsername(userDto.getUsername())) {
                throw new UserValidation.UsernameAlreadyExists("Username is already taken");
            }
            if (!existingUser.getEmail().equals(userDto.getEmail()) &&
                    userRepository.existsByEmail(userDto.getEmail())) {
                throw new UserValidation.EmailAlreadyExists("Email is already taken");
            }
            if (!UserValidation.isValidEmail(userDto.getEmail())) {
                throw new UserValidation.InvalidEmailFormat("Invalid email format");
            }
            if (userDto.getPassword() != null && !UserValidation.isValidPassword(userDto.getPassword())) {
                throw new UserValidation.InvalidPasswordFormat("Invalid password format.");
            }
            UserModel updatedUser = userMapper.toUserModel(existingUser, userDto);
            Instant instantTimestamp = Instant.parse(timestamp);
            updatedUser.setUpdatedAt(instantTimestamp);
            UserModel savedUser = userService.saveUser(updatedUser);
            UserDto.UserResponseDto updatedUserDto = userMapper.toUserResponseDto(savedUser);
            return ResponseEntity.ok(updatedUserDto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Deactivate (soft delete) a user by their ID.")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(
            @RequestHeader(value = "X-Timestamp", required = true) String timestamp,
            @PathVariable Long id) {
        try {
            Instant instantTimestamp = Instant.parse(timestamp);
            Optional<UserModel> optionalUser = userRepository.findById(id);
            if (optionalUser.isPresent()) {
                UserModel user = optionalUser.get();
                user.setUserStatus(UserModel.UserStatus.INACTIVE);
                user.setUpdatedAt(instantTimestamp);
                userRepository.save(user);
                return ResponseEntity.ok("Your account has been successfully deactivated.");
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
