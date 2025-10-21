package com.wildeats.onlinecanteen.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wildeats.onlinecanteen.entity.UserEntity;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    /**
     * Find a user by their email address
     * @param email The email address to search for
     * @return The user if found, null otherwise
     */
    UserEntity findByEmail(String email);
}
