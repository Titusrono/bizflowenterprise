import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Inventory } from '../../service/inventory.service';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.scss'],
})
export class InventoryListComponent {
  @Input() items: Inventory[] = [];
  @Input() loading = false;

  @Output() edit = new EventEmitter<Inventory>();
  @Output() remove = new EventEmitter<string>();
}
