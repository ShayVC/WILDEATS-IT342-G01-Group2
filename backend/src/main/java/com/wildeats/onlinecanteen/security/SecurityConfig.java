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

/**
 * Security Configuration for WILDEATS Online Canteen System
 * 
 * Architecture Alignment:
 * Layer A (Identity): JWT authentication for USER table
 * Layer B (Commerce): RBAC for SHOP/MENU_ITEM access
 * Layer C (Transactions): Authorization for ORDER management
 * 
 * Security Principles:
 * 1. Stateless JWT tokens (no server-side sessions)
 * 2. Role-based access control (CUSTOMER, SELLER, ADMIN)
 * 3. Rate limiting on auth endpoints
 * 4. CORS configured for frontend origins
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

        @Autowired
        private JwtAuthenticationFilter jwtAuthenticationFilter;

        @Autowired
        private RateLimitingFilter rateLimitingFilter;

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

                                                // Auth endpoints - public
                                                .requestMatchers(
                                                                "/api/auth/login",
                                                                "/api/auth/register",
                                                                "/api/auth/logout",
                                                                "/api/auth/verify-token",
                                                                "/api/auth/refresh-token")
                                                .permitAll()

                                                // Test endpoints - public
                                                .requestMatchers("/api/test", "/api/canteen/test").permitAll()

                                                // Shop endpoints - public read access
                                                .requestMatchers("GET",
                                                                "/api/shops",
                                                                "/api/shops/*",
                                                                "/api/shops/status/*")
                                                .permitAll()

                                                // Menu item endpoints - public read access
                                                .requestMatchers("GET",
                                                                "/api/menu-items/shop/*",
                                                                "/api/menu-items/shop/*/search",
                                                                "/api/menu-items/shop/*/price",
                                                                "/api/menu-items/shop/*/count",
                                                                "/api/menu-items/*")
                                                .permitAll()

                                                // User profile viewing - public (limited info)
                                                .requestMatchers("GET", "/api/users/*").permitAll()

                                                // ============================================
                                                // AUTHENTICATED ENDPOINTS (Require JWT Token)
                                                // ============================================

                                                // Auth check endpoint
                                                .requestMatchers("/api/auth/check").authenticated()

                                                // User profile management (own profile only)
                                                .requestMatchers(
                                                                "/api/users/profile",
                                                                "/api/users/profile/password")
                                                .authenticated()
                                                .requestMatchers("PUT", "/api/users/profile").authenticated()
                                                .requestMatchers("DELETE", "/api/users/profile").authenticated()

                                                // Shop management (SELLER role checked in controller)
                                                .requestMatchers("POST", "/api/shops").authenticated()
                                                .requestMatchers("PUT",
                                                                "/api/shops/*",
                                                                "/api/shops/*/toggle-status")
                                                .authenticated()
                                                .requestMatchers("DELETE", "/api/shops/*").authenticated()
                                                .requestMatchers("/api/shops/my-shops").authenticated()

                                                // Menu item management (SELLER role checked in controller)
                                                .requestMatchers("POST", "/api/menu-items").authenticated()
                                                .requestMatchers("PUT",
                                                                "/api/menu-items/*",
                                                                "/api/menu-items/*/availability")
                                                .authenticated()
                                                .requestMatchers("DELETE", "/api/menu-items/*").authenticated()

                                                // Order endpoints (role checked in controller)
                                                .requestMatchers("/api/orders/**").authenticated()

                                                // ============================================
                                                // ADMIN ENDPOINTS (Secured with @PreAuthorize)
                                                // ============================================
                                                // These are protected by @PreAuthorize("hasRole('ADMIN')") annotations

                                                .requestMatchers(
                                                                "/api/users",
                                                                "/api/users/customers",
                                                                "/api/users/sellers")
                                                .authenticated()
                                                .requestMatchers("PUT", "/api/users/*/roles").authenticated()
                                                .requestMatchers("DELETE", "/api/users/*/roles/*").authenticated()
                                                .requestMatchers("POST", "/api/users/*/roles").authenticated()

                                                .requestMatchers(
                                                                "/api/shops/admin/all",
                                                                "/api/shops/*/approve",
                                                                "/api/shops/*/suspend",
                                                                "/api/shops/*/close")
                                                .authenticated()

                                                // All other requests require authentication
                                                .anyRequest().authenticated())
                                .exceptionHandling(exception -> exception
                                                .accessDeniedHandler(accessDeniedHandler)
                                                .authenticationEntryPoint(authenticationEntryPoint))
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                // Add rate limiting filter BEFORE JWT filter
                                .addFilterBefore(rateLimitingFilter, UsernamePasswordAuthenticationFilter.class)
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOrigins(Arrays.asList(
                                "http://localhost:3000",
                                "http://127.0.0.1:3000",
                                "http://localhost:8080",
                                "http://127.0.0.1:8080"));
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