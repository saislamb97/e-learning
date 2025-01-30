package com.learning.user;

import com.learning.user.model.UserModel;
import com.learning.user.model.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserDetailsService userDetailsService() {
        return new UserDetailsService() {
            @Override
            public UserDetails loadUserByUsername(String email) {
                return userRepository.findByEmail(email)
                        .orElseThrow(() -> new UsernameNotFoundException("UserModel not found"));
            }
        };
    }

    @Transactional
    public UserModel saveUser(UserModel user) {
        return userRepository.save(user);
    }

    public Optional<UserModel> getUserByUsername(String username) {return userRepository.findByEmail(username);}

    public Optional<UserModel> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Page<UserModel> getAllUsers(int page, int limit, String sortBy, Sort.Direction direction) {
        PageRequest pageRequest = PageRequest.of(page - 1, limit, Sort.by(direction, sortBy)); // Adding sort and direction
        return userRepository.findAll(pageRequest);
    }

    public Optional<UserModel> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Transactional
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
