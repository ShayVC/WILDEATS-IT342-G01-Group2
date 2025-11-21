package com.wildeats.onlinecanteen.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private CustomAccessDeniedHandler accessDeniedHandler;

    @Autowired
    private CustomAuthenticationEntryPoint authenticationEntryPoint;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        // ============================================
                        // PUBLIC ENDPOINTS (No Authentication Required)
                        // ============================================

                        // Auth endpoints
                        .requestMatchers("/api/auth/login", "/api/auth/register", "/api/auth/logout").permitAll()

                        // Test endpoints
                        .requestMatchers("/api/test", "/api/canteen/test").permitAll()

                        // Shop endpoints - public read access
                        .requestMatchers("GET", "/api/shop", "/api/shop/*").permitAll()

                        // Food item endpoints - public read access
                        .requestMatchers("GET", "/api/food/shop/*", "/api/food/*").permitAll()

                        // ============================================
                        // AUTHENTICATED ENDPOINTS (Require JWT Token)
                        // ============================================

                        // Auth check endpoint
                        .requestMatchers("/api/auth/check").authenticated()

                        // User profile endpoints
                        .requestMatchers("/api/users/profile", "/api/users/profile/**").authenticated()

                        // Shop management (SELLER only, but checked in controller)
                        .requestMatchers("POST", "/api/shop").authenticated()
                        .requestMatchers("PUT", "/api/shop/*").authenticated()
                        .requestMatchers("DELETE", "/api/shop/*").authenticated()
                        .requestMatchers("/api/shop/my-shops").authenticated()

                        // Food item management (SELLER only, but checked in controller)
                        .requestMatchers("POST", "/api/food").authenticated()
                        .requestMatchers("PUT", "/api/food/*", "/api/food/*/quantity").authenticated()
                        .requestMatchers("DELETE", "/api/food/*").authenticated()

                        // Order endpoints (all require authentication)
                        .requestMatchers("/api/orders/**").authenticated()

                        // Canteen order endpoints (if still in use)
                        .requestMatchers("/api/canteen/**").authenticated()

                        // ============================================
                        // ADMIN ENDPOINTS (Temporarily blocked)
                        // ============================================
                        // These should be refactored to use @PreAuthorize("hasRole('ADMIN')")

                        .requestMatchers("/api/users/getAllUsers").denyAll() // Insecure - block for now
                        .requestMatchers("POST", "/api/users/createUser").denyAll() // Use /register instead
                        .requestMatchers("GET", "/api/users/*").denyAll() // Insecure - should use /profile
                        .requestMatchers("PUT", "/api/users/*").denyAll() // Insecure - should use /profile
                        .requestMatchers("DELETE", "/api/users/*").denyAll() // Insecure - should use /profile

                        // All other requests require authentication
                        .anyRequest().authenticated())
                .exceptionHandling(exception -> exception
                        .accessDeniedHandler(accessDeniedHandler)
                        .authenticationEntryPoint(authenticationEntryPoint))
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://127.0.0.1:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}