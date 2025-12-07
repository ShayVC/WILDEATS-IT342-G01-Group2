package com.wildeats.onlinecanteen.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * Rate Limiting Filter to prevent brute force attacks on authentication
 * endpoints
 * 
 * Architecture Alignment:
 * - Protects the "Passport System" (USER authentication)
 * - Prevents malicious actors from overwhelming the login endpoint
 * - Implements sliding window rate limiting per IP address
 */
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    // Simple in-memory rate limiting (for production, use Redis or similar)
    private final ConcurrentHashMap<String, RequestCounter> requestCounts = new ConcurrentHashMap<>();

    // Rate limit: 5 login attempts per minute per IP
    private static final int MAX_REQUESTS_PER_WINDOW = 5;
    private static final long WINDOW_SIZE_MS = TimeUnit.MINUTES.toMillis(1);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestURI = request.getRequestURI();

        // Only apply rate limiting to authentication endpoints
        if (requestURI.equals("/api/auth/login") || requestURI.equals("/api/auth/register")) {
            String clientIP = getClientIP(request);

            if (isRateLimited(clientIP)) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json");
                response.getWriter().write(
                        "{\"message\": \"Too many authentication attempts. Please try again later.\", \"retryAfter\": 60}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isRateLimited(String clientIP) {
        long currentTime = System.currentTimeMillis();

        requestCounts.compute(clientIP, (key, counter) -> {
            if (counter == null) {
                return new RequestCounter(1, currentTime);
            }

            // If window has expired, reset counter
            if (currentTime - counter.windowStart > WINDOW_SIZE_MS) {
                return new RequestCounter(1, currentTime);
            }

            // Increment counter within current window
            counter.count++;
            return counter;
        });

        RequestCounter counter = requestCounts.get(clientIP);
        return counter.count > MAX_REQUESTS_PER_WINDOW;
    }

    private String getClientIP(HttpServletRequest request) {
        // Check for IP in headers (for proxied requests)
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        // Take first IP if multiple are present
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }

    // Simple counter class
    private static class RequestCounter {
        int count;
        long windowStart;

        RequestCounter(int count, long windowStart) {
            this.count = count;
            this.windowStart = windowStart;
        }
    }

    // Cleanup task (run periodically to prevent memory leaks)
    public void cleanup() {
        long currentTime = System.currentTimeMillis();
        requestCounts.entrySet().removeIf(entry -> currentTime - entry.getValue().windowStart > WINDOW_SIZE_MS * 2);
    }
}