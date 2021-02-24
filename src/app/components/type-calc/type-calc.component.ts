import { Component } from '@angular/core';
import { TypeService } from 'src/app/services/type.service';
import { Type } from 'src/app/types/type';

@Component({
  selector: 'app-type-calc',
  templateUrl: './type-calc.component.html',
  styleUrls: ['./type-calc.component.scss'],
})
export class TypeCalcComponent {

  /**
   * list if all types
   */
  allTypes = [];
  /**
   * all types set of attacking party
   */
  setFromTypes: Type[] = [];
  /**
   * all types set of attacked party
   */
  setToTypes: Type[] = [];

  /**
   * some text as output on effectiveness
   */
  textOutput: string = 'Werte fehlen.';

  /**
   * gather all types for attacking and attacked part
   * @param typesService      DB service to receive typ information
   */
  constructor(private typeService: TypeService) {
    this.typeService.getAll().subscribe(types => this.allTypes = types);
  }

  /**
   * called on toggle of from-type button, updates output information on effectiveness
   * @param  type   the specific type
   */
  toggleFrom(type: Type): void {

    if (this.setFromTypes.includes(type)) {
      this.setFromTypes = this.setFromTypes.filter(t => t !== type);
    } else {
      this.setFromTypes.push(type);
    }

    this.updateTypes();
  }
  
  toggleTo(type: Type): void {
    
    if (this.setToTypes.includes(type)) {
      this.setToTypes = this.setToTypes.filter(t => t !== type);
    } else {
      this.setToTypes.push(type);
    }
    
    this.updateTypes();
  }
  
  private updateTypes() {
    
    // if none in from and/or to is not set
    if (!this.setFromTypes.length || !this.setToTypes.length) {
      this.textOutput = 'Werte fehlen.';
      return;
    }
  
    // get changed efficiencies from service
    this.typeService.getEfficiency(this.setFromTypes, this.setToTypes, true).subscribe(efficiencies => {

      const eff = efficiencies.reduce((sum, efficiency) => {
        return sum + efficiency.efficiencyValue
      }, 1.0);

      if (eff === 0) {this.textOutput = 'wirkungslos'; return;}

      if (eff === 1) {this.textOutput = 'normaleffektiv'; return;}

      if (eff < 1) {
        this.textOutput = `nicht sehr effektiv. 1/${Math.pow(2, eff).toString()} x`;
        return;
      }

      // if eff > 2
      this.textOutput = `sehr effektiv. ${eff.toString()} x`;
    });
  }

  clearAll() {
    this.setFromTypes = [];
    this.setToTypes = [];
  }
}
