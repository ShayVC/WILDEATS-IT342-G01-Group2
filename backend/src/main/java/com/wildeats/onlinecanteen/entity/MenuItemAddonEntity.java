package com.wildeats.onlinecanteen.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "menu_item_addon")
public class MenuItemAddonEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long addonId;

    @ManyToOne
    @JoinColumn(name = "item_id", nullable = false)
    private MenuItemEntity menuItem;

    @Column(nullable = false, length = 100)
    private String label; // e.g., "Extra Cheese"

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
}