import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-general-ledger-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './general-ledger-form.component.html',
  styleUrls: ['./general-ledger-form.component.scss'],
})
export class GeneralLedgerFormComponent {
  // General Ledger is typically read-only and managed through journal posting
  // This component can be used for reconciliation or manual adjustments if needed
}
