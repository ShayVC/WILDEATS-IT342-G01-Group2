package com.wildeats.onlinecanteen.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "menu_item_flavor")
public class MenuItemFlavorEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long flavorId;

    @ManyToOne
    @JoinColumn(name = "item_id", nullable = false)
    private MenuItemEntity menuItem;

    @Column(nullable = false, length = 100)
    private String name; // "Chocolate", "Vanilla"
}
