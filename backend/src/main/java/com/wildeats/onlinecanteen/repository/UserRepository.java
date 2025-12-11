package com.wildeats.onlinecanteen.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.wildeats.onlinecanteen.entity.UserEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    /**
     * Find a user by their email address
     * 
     * @param email The email address to search for
     * @return Optional containing the user if found
     */
    Optional<UserEntity> findByEmail(String email);

    /**
     * Check if a user exists by email
     * 
     * @param email The email address to check
     * @return true if user exists, false otherwise
     */
    boolean existsByEmail(String email);

    /**
     * Find all users with a specific role
     * 
     * @param roleName The name of the role
     * @return List of users with the specified role
     */
    @Query("SELECT u FROM UserEntity u JOIN u.roles r WHERE r.roleName = :roleName")
    List<UserEntity> findByRoleName(@Param("roleName") String roleName);

    /**
     * Find all customers (users with CUSTOMER role)
     * 
     * @return List of customer users
     */
    @Query("SELECT u FROM UserEntity u JOIN u.roles r WHERE r.roleName = 'CUSTOMER'")
    List<UserEntity> findAllCustomers();

    /**
     * Find all sellers (users with SELLER role)
     * 
     * @return List of seller users
     */
    @Query("SELECT u FROM UserEntity u JOIN u.roles r WHERE r.roleName = 'SELLER'")
    List<UserEntity> findAllSellers();
}