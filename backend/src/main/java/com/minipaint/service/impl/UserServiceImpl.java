package com.minipaint.service.impl;

import com.minipaint.model.dto.request.*;
import com.minipaint.model.dto.response.AuthResponse;
import com.minipaint.model.entity.User;
import com.minipaint.repository.UserRepository;
import com.minipaint.security.JwtTokenProvider;
import com.minipaint.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, JwtTokenProvider jwtTokenProvider, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("该邮箱已注册");
        }
        User user = new User(request.getEmail(), passwordEncoder.encode(request.getPassword()));
        user = userRepository.save(user);
        String token = jwtTokenProvider.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail());
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("邮箱或密码错误"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("邮箱或密码错误");
        }
        String token = jwtTokenProvider.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail());
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("该邮箱未注册"));
        // MVP: log reset token to console instead of sending email
        String resetToken = jwtTokenProvider.generateToken(request.getEmail() + ":reset");
        System.out.println("Reset token for " + request.getEmail() + ": " + resetToken);
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        if (!jwtTokenProvider.validateToken(request.getToken())) {
            throw new RuntimeException("重置链接已过期或无效");
        }
        String email = jwtTokenProvider.extractEmail(request.getToken()).replace(":reset", "");
        User existing = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        User updated = new User(existing.getEmail(), passwordEncoder.encode(request.getNewPassword()));
        updated = userRepository.save(updated);
    }
}
