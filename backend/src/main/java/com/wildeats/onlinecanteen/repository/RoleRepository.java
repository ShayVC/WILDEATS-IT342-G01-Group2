package com.wildeats.onlinecanteen.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.wildeats.onlinecanteen.entity.RoleEntity;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<RoleEntity, Long> {
    /**
     * Find a role by its name
     * 
     * @param roleName The name of the role
     * @return Optional containing the role if found
     */
    Optional<RoleEntity> findByRoleName(String roleName);

    /**
     * Check if a role exists by name
     * 
     * @param roleName The name of the role
     * @return true if the role exists, false otherwise
     */
    boolean existsByRoleName(String roleName);
}