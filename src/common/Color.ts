import _ from "lodash";
import { IColor } from "office-ui-fabric-react";

export class Color {
    public static parse(val: string, iColor?: IColor): Color {
        const red = parseInt(val.substr(1, 2), 16);
        const green = parseInt(val.substr(3, 2), 16);
        const blue = parseInt(val.substr(5, 2), 16);
        return new Color(red, green, blue, 1, iColor);
    }

    private _alpha: number;
    private _red: number;
    private _green: number;
    private _blue: number;
    private _iColor: IColor;

    constructor(red: number, green: number, blue: number, alpha: number = 1.0, iColor: IColor = null) {
        this._alpha = alpha;
        this._red = red;
        this._green = green;
        this._blue = blue;
        this._iColor = iColor;
    }

    public clone(): Color {
        return new Color(this.red, this.green, this.blue, this.alpha);
    }

    public get alpha(): number { return this._alpha; }
    public get red(): number { return this._red; }
    public get green(): number { return this._green; }
    public get blue(): number { return this._blue; }
    public get iColor(): IColor { return this._iColor; }

    public set alpha(val: number) { this._alpha = _.clamp(val, 0.0, 1.0); }
    public set red(val: number) { this._red = _.clamp(val, 0, 255); }
    public set green(val: number) { this._green = _.clamp(val, 0, 255); }
    public set blue(val: number) { this._blue = _.clamp(val, 0, 255); }
    public set iColor(val: IColor) { this._iColor = val; }

    public opacity(val: number): this {
        this.alpha = val;
        return this;
    }

    public toCssString(): string {
        return `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.alpha})`;
    }

    public toHexString(): string {
        const toHexComponent = (val: number) => _.padStart(val.toString(16), 2, '0');
        const red = toHexComponent(this.red);
        const green = toHexComponent(this.green);
        const blue = toHexComponent(this.blue);
        return `#${red}${green}${blue}`;
    }
}