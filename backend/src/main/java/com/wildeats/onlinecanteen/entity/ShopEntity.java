package com.wildeats.onlinecanteen.entity;

import jakarta.persistence.*;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "shop")
public class ShopEntity {

    public enum Status {
        ACTIVE,
        PENDING,
        REJECTED,
        SUSPENDED,
        CLOSED
    }

    // Location enum matching frontend options
    public enum Location {
        JHS_CANTEEN("JHS Canteen"),
        MAIN_CANTEEN("Main Canteen"),
        PRESCHOOL_CANTEEN("Preschool Canteen"),
        FRONTGATE("Frontgate"),
        BACKGATE("Backgate");

        private final String displayName;

        Location(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }

        // Convert from display name to enum
        public static Location fromDisplayName(String displayName) {
            for (Location location : Location.values()) {
                if (location.getDisplayName().equals(displayName)) {
                    return location;
                }
            }
            throw new IllegalArgumentException("Unknown location: " + displayName);
        }
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "shop_id")
    private Long shopId;

    @Column(name = "shop_name", nullable = false, length = 100)
    private String shopName;

    @Column(name = "shop_descr", nullable = false, length = 500)
    private String shopDescr;

    @Column(name = "shop_address", nullable = false, length = 200)
    private String shopAddress;

    @Enumerated(EnumType.STRING)
    @Column(name = "location", nullable = false, length = 50)
    private Location location;

    @Column(name = "contact_number", nullable = false, length = 20)
    private String contactNumber;

    @Column(name = "shop_image_url", length = 255)
    private String shopImageURL;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.PENDING;

    @Column(name = "is_open")
    private Boolean isOpen = false;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id", nullable = false)
    @JsonIgnoreProperties({ "roles", "password", "shops", "orders" })
    private UserEntity owner;

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    public ShopEntity() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    // Helper methods
    public boolean isOperational() {
        return status == Status.ACTIVE && isOpen;
    }

    public void updateTimestamp() {
        this.updatedAt = new Date();
    }

    // Getters and Setters
    public Long getShopId() {
        return shopId;
    }

    public void setShopId(Long shopId) {
        this.shopId = shopId;
    }

    public String getShopName() {
        return shopName;
    }

    public void setShopName(String shopName) {
        this.shopName = shopName;
    }

    public String getName() {
        return shopName;
    }

    public void setName(String name) {
        this.shopName = name;
    }

    public String getShopDescr() {
        return shopDescr;
    }

    public void setShopDescr(String shopDescr) {
        this.shopDescr = shopDescr;
    }

    public String getDescription() {
        return shopDescr;
    }

    public void setDescription(String description) {
        this.shopDescr = description;
    }

    public String getShopAddress() {
        return shopAddress;
    }

    public void setShopAddress(String shopAddress) {
        this.shopAddress = shopAddress;
    }

    public Location getLocation() {
        return location;
    }

    public void setLocation(Location location) {
        this.location = location;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public String getShopImageURL() {
        return shopImageURL;
    }

    public void setShopImageURL(String shopImageURL) {
        this.shopImageURL = shopImageURL;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public Boolean getIsOpen() {
        return isOpen;
    }

    public void setIsOpen(Boolean isOpen) {
        this.isOpen = isOpen;
    }

    public boolean isActive() {
        return status == Status.ACTIVE;
    }

    public void setActive(boolean active) {
        this.status = active ? Status.ACTIVE : Status.SUSPENDED;
    }

    public UserEntity getOwner() {
        return owner;
    }

    public void setOwner(UserEntity owner) {
        this.owner = owner;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }
}