import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockFormComponent } from './stock-form.component';

describe('StockFormComponent', () => {
  let component: StockFormComponent;
  let fixture: ComponentFixture<StockFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
