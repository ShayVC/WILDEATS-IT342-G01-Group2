package com.wildeats.onlinecanteen.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class UserEntity {
    
    public enum Role {
        CUSTOMER,
        SELLER
    }
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(nullable = false, unique = true, length = 100)
    private String email;
    
    @Column(nullable = false, length = 255)
    private String password;
    
    @Enumerated(EnumType.STRING)
    private Role role;
    
    @Column(name = "is_active")
    private boolean isActive = true;
    
    @Column(name = "created_at")
    private java.util.Date createdAt;
    
    @Column(name = "last_login")
    private java.util.Date lastLogin;

    public UserEntity() {
        this.createdAt = new java.util.Date();
    }

    public UserEntity(String name, String email, String password, Role role) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.createdAt = new java.util.Date();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
    
    public Role getRole() {
        return role;
    }
    
    public void setRole(Role role) {
        this.role = role;
    }
    
    public boolean isActive() {
        return isActive;
    }
    
    public void setActive(boolean isActive) {
        this.isActive = isActive;
    }
    
    public java.util.Date getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(java.util.Date createdAt) {
        this.createdAt = createdAt;
    }
    
    public java.util.Date getLastLogin() {
        return lastLogin;
    }
    
    public void setLastLogin(java.util.Date lastLogin) {
        this.lastLogin = lastLogin;
    }
    
    /**
     * Determine if the user is a seller based on their role
     * @return true if the user is a seller, false otherwise
     */
    public boolean isSeller() {
        return this.role == Role.SELLER;
    }
    
    /**
     * Determine if the user is a customer based on their role
     * @return true if the user is a customer, false otherwise
     */
    public boolean isCustomer() {
        return this.role == Role.CUSTOMER;
    }
}
