import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule, FormsModule],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css'],
})
export class TransactionsComponent implements OnInit {
  transactions: any[] = [];
  recentTransactions: any[] = [];
  investments: any[] = [];
  userId: number|null = null; // Default value
  totalInvestmentValue = 0;
  totalInvestmentCost = 0;
  totalGainLoss = 0;
  totalGainLossPercentage = 0;
  perDayGainLoss = 10;
  loading = true;
  error = '';

  constructor(private http: HttpClient, private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get current user ID from AuthService
    this.authService.loggedInUser().subscribe((user: { id: number } | null) => {
      if (user) {
        this.userId = user.id;
        console.log('User ID from auth service:', this.userId);
        this.loadInvestments();
      } else {
        // Handle case where user is not logged in
        this.error = 'Please log in to view investments';
        this.loading = false;
      }
    });
  }


  // Load investments and calculate totals
  loadInvestments(): void {
    this.http.get<any[]>('http://localhost:3000/investments').subscribe({
      next: (data) => {
        this.investments = data.filter((inv) => inv.userId === this.userId); // Filter by userId
        this.transactions = this.investments.map((item: any) => {
          return {
            id: item.id,
            name:
              item.stockName ||
              item.fixedIncomeName ||
              item.schemeName ||
              item.securityName ||
              'N/A',
            type: item.type,
            transactionType: item.transactionType,
            date: item.purchaseDate || item.investmentDate || 'N/A',
            amount:
              item.purchasePrice ||
              item.investmentAmount ||
              item.amount ||
              item.price ||
              'N/A',
            units: item.numberOfShares || item.units || 'N/A',
          };
        });

        // Sort transactions by date (most recent first) and get the top 5
        this.recentTransactions = this.transactions
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .slice(0, 5);

        // Calculate totals
        this.calculateTotals();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching investments:', err);
        this.error = 'Failed to load investments';
        this.loading = false;
      },
    });
  }

  // Calculate totals for investments
  calculateTotals(): void {
    this.totalInvestmentCost = 0;
    this.totalInvestmentValue = 0;
     // Only consider 'buy' transactions
  const buyInvestments = this.investments.filter(inv => inv.transactionType === 'buy');

    for (const inv of this.investments) {
      if (inv.type === 'stock') {
        const cost = inv.purchasePrice * inv.numberOfShares;
        this.totalInvestmentCost += cost;
        const currentPrice = inv.purchasePrice * 1.05; // Dummy current price +5%
        this.totalInvestmentValue += currentPrice * inv.numberOfShares;
      } else if (inv.type === 'mutualFund') {
        const units =
          inv.amountType === 'Rupees' ? inv.amount / inv.price : inv.amount;
        const currentPrice = inv.price * 1.05;
        this.totalInvestmentCost += units * inv.price;
        this.totalInvestmentValue += units * currentPrice;
      } else if (inv.type === 'goldBond') {
        const cost = inv.units * inv.price; // Initial cost of investment
        const currentPrice = inv.price * 1.05; // Assuming 5% appreciation
        this.totalInvestmentCost += cost;
        this.totalInvestmentValue += inv.units * currentPrice;
      } else if (inv.type === 'bond') {
        this.totalInvestmentCost += inv.investmentAmount;
        this.totalInvestmentValue += inv.investmentAmount * 1.02; // Assume 2% appreciation
      }
    }

    this.totalGainLoss = this.totalInvestmentValue - this.totalInvestmentCost;
    this.totalGainLossPercentage =
      (this.totalGainLoss / this.totalInvestmentCost) * 100;
  }

  // Navigation methods
  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToHoldings(): void {
    this.router.navigate(['/holdings']);
  }

  goToTransactions(): void {
    this.router.navigate(['/transactions']);
  }
}