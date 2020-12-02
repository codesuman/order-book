export class Spread {
    price: number;
    quantity: number;

    percentage: number;
    hsl: any;

    constructor(price: number, quantity: number, percentage: number, hsl: any){
        this.price = price;
        this.quantity = quantity;
        this.percentage = +percentage.toFixed(2);
        this.hsl = hsl;

        this.calculate();
    }
    
    private calculate() {
        this._perUnitProfitOrLoss = +(this.price * (this.percentage / 100)).toFixed(2);

        this._perUnitUp = this.price + this._perUnitProfitOrLoss;
        this._perUnitDown = this.price - this._perUnitProfitOrLoss;
        
        this._totalProfitOrLoss = +(this.quantity * this._perUnitProfitOrLoss).toFixed(2);

        this._totalUp = (this.price * this.quantity) + this._totalProfitOrLoss;
        this._totalDown = (this.price * this.quantity) - this._totalProfitOrLoss;

        this._profitHSL = `hsl(
            ${this.hsl.hues[0]},    
            ${this.hsl.saturation}%, 
            ${this.hsl.light}%
          )`

        this._lossHSL = `hsl(
            ${this.hsl.hues[1]},    
            ${this.hsl.saturation}%, 
            ${this.hsl.light}%
        )` 
    }

    private _perUnitUp!: number;
    public get perUnitUp(): number {
        return this._perUnitUp;
    }
    public set perUnitUp(value: number) {
        this._perUnitUp = value;
    }

    private _perUnitDown!: number;
    public get perUnitDown(): number {
        return this._perUnitDown;
    }
    public set perUnitDown(value: number) {
        this._perUnitDown = value;
    }

    private _perUnitProfitOrLoss!: number;
    public get perUnitProfitOrLoss(): number {
        return this._perUnitProfitOrLoss;
    }
    public set perUnitProfitOrLoss(value: number) {
        this._perUnitProfitOrLoss = value;
    }

    private _totalUp!: number;
    public get totalUp(): number {
        return this._totalUp;
    }
    public set totalUp(value: number) {
        this._totalUp = value;
    }

    private _totalDown!: number;
    public get totalDown(): number {
        return this._totalDown;
    }
    public set totalDown(value: number) {
        this._totalDown = value;
    }

    private _totalProfitOrLoss!: number;
    public get totalProfitOrLoss(): number {
        return this._totalProfitOrLoss;
    }
    public set totalProfitOrLoss(value: number) {
        this._totalProfitOrLoss = value;
    }

    private _profitHSL!: string;
    public get profitHSL(): string {
        return this._profitHSL;
    }
    public set profitHSL(value: string) {
        this._profitHSL = value;
    }

    private _lossHSL!: string;
    public get lossHSL(): string {
        return this._lossHSL;
    }
    public set lossHSL(value: string) {
        this._lossHSL = value;
    }
}
