package com.wildeats.onlinecanteen.security;

import com.wildeats.onlinecanteen.entity.RoleEntity;
import com.wildeats.onlinecanteen.entity.UserEntity;
import com.wildeats.onlinecanteen.repository.RoleRepository;
import com.wildeats.onlinecanteen.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        OAuth2User oAuth2User = oauthToken.getPrincipal();

        // Extract user information from Google
        Map<String, Object> attributes = oAuth2User.getAttributes();
        String email = (String) attributes.get("email");
        String givenName = (String) attributes.get("given_name");
        String familyName = (String) attributes.get("family_name");
        String picture = (String) attributes.get("picture");

        // Find or create user
        UserEntity user = findOrCreateUser(email, givenName, familyName, picture);

        // Determine primary role (Priority: ADMIN > SELLER > CUSTOMER)
        String primaryRole = "CUSTOMER"; // Default role
        if (user.isAdmin()) {
            primaryRole = "ADMIN";
        } else if (user.isSeller()) {
            primaryRole = "SELLER";
        } else if (user.isCustomer()) {
            primaryRole = "CUSTOMER";
        } else if (!user.getRoles().isEmpty()) {
            primaryRole = user.getRoles().iterator().next().getRoleName();
        }

        // Get all role names
        List<String> roleNames = user.getRoles().stream()
                .map(RoleEntity::getRoleName)
                .collect(Collectors.toList());

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getUserId(), user.getEmail(), primaryRole);

        // Redirect to frontend with token and user info
        String redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth-callback")
                .queryParam("token", token)
                .queryParam("userId", user.getUserId())
                .queryParam("email", user.getEmail())
                .queryParam("firstName", user.getFirstName())
                .queryParam("lastName", user.getLastName())
                .queryParam("role", primaryRole)
                .queryParam("roles", String.join(",", roleNames))
                .build()
                .toUriString();

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }

    @Transactional
    private UserEntity findOrCreateUser(String email, String givenName, String familyName, String picture) {
        Optional<UserEntity> existingUser = userRepository.findByEmail(email);

        if (existingUser.isPresent()) {
            // Update avatar URL if it has changed
            UserEntity user = existingUser.get();
            if (picture != null && !picture.equals(user.getAvatarURL())) {
                user.setAvatarURL(picture);
                userRepository.save(user);
            }
            return user;
        }

        // Create new user
        UserEntity newUser = new UserEntity();
        newUser.setEmail(email);
        newUser.setFirstName(givenName != null ? givenName : "User");
        newUser.setLastName(familyName != null ? familyName : "");
        newUser.setAvatarURL(picture);
        newUser.setCreatedAt(new Date());

        // Set a placeholder password (OAuth users don't need passwords)
        // But the entity requires it, so set a random secure string
        newUser.setPassword("OAUTH_USER_" + System.currentTimeMillis());

        // Assign CUSTOMER role by default
        Optional<RoleEntity> customerRole = roleRepository.findByRoleName("CUSTOMER");
        if (customerRole.isPresent()) {
            newUser.addRole(customerRole.get());
        }

        return userRepository.save(newUser);
    }
}