import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { StockSearchComponent } from '../stock-search/stock-search.component';

@Component({
  selector: 'app-stock-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    StockSearchComponent,
  ],
  templateUrl: './stock-form.component.html',
  styleUrl: './stock-form.component.css',
})
export class StockFormComponent implements OnInit {
  @Input() data: any;
  @Input() isEditMode = false;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  selectedInvestment: { transactionType: string } = { transactionType: '' };
  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({
      transactionType: [
        this.data?.transactionType || 'buy',
        Validators.required,
      ],
      stockName: [this.data?.stockName || '', Validators.required],
      dematAccount: [this.data?.dematAccount || '', Validators.required],
      investmentDate: [this.data?.investmentDate || '', Validators.required],
      numberOfShares: [this.data?.numberOfShares || '', Validators.required],
      brokerage: [this.data?.brokerage || '', Validators.required],
      brokerageType: [this.data?.brokerageType || '%', Validators.required],
      purchasePrice: [this.data?.purchasePrice || '', Validators.required],
    });
    if (this.isEditMode) {
      this.form.get('stockName')?.disable();
    }
  }

  onStockSelected(symbol: string) {
    this.form.get('stockName')?.setValue(symbol);
  }

  submit() {
    if (this.form.valid) {
      this.save.emit(this.form.getRawValue());
    }
  }
}
// Removed the incorrect Output function definition to avoid conflicts with Angular's @Output decorator.
