import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="modal-overlay" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ title }}</h3>
          <button class="close-btn" (click)="onCancel()">&times;</button>
        </div>
        
        <div class="modal-body">
          <p>{{ message }}</p>
          <p *ngIf="itemName" class="item-name">{{ itemName }}</p>
        </div>
        
        <div class="modal-footer">
          <button class="btn-secondary" (click)="onCancel()">
            Cancelar
          </button>
          <button class="btn-danger" (click)="onConfirm()">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      min-width: 400px;
      max-width: 500px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateY(-50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      padding: 20px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h3 {
      margin: 0;
      color: #333;
      font-size: 1.25rem;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .close-btn:hover {
      background-color: #f0f0f0;
    }

    .modal-body {
      padding: 20px;
      color: #555;
    }

    .modal-body p {
      margin: 0 0 10px 0;
      line-height: 1.5;
    }

    .item-name {
      font-weight: 600;
      color: #d32f2f;
      font-size: 1.1em;
      margin-top: 10px !important;
    }

    .modal-footer {
      padding: 20px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    .btn-secondary {
      padding: 10px 20px;
      border: 1px solid #ccc;
      background: white;
      color: #333;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s;
    }

    .btn-secondary:hover {
      background-color: #f5f5f5;
      border-color: #999;
    }

    .btn-danger {
      padding: 10px 20px;
      border: none;
      background: #d32f2f;
      color: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      transition: background-color 0.2s;
    }

    .btn-danger:hover {
      background-color: #b71c1c;
    }

    @media (max-width: 600px) {
      .modal-content {
        min-width: 90%;
        margin: 20px;
      }
    }
  `]
})
export class ConfirmModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Confirmar eliminación';
  @Input() message: string = '¿Está seguro de que desea eliminar este elemento?';
  @Input() itemName?: string;
  
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
