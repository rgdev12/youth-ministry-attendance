import { Component, OnInit } from '@angular/core';
import { MainLayout } from '@shared/layouts/main-layout/main-layout.component';
import { ActivatedRoute } from '@angular/router';
import { MemberService } from '@core/services/member.service';
import { Member } from '@core/models/member.model';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-attendances',
  imports: [MainLayout, DatePickerModule, FormsModule],
  templateUrl: './attendances.component.html',
  styleUrl: './attendances.component.scss',
})
export default class Attendances implements OnInit {
  selectedDate: Date = new Date();

  constructor(private route: ActivatedRoute, private memberService: MemberService) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const groupId = params['group'];
      // obtenemos los miembros según el grupo
      this.memberService.getMembersByGroup(groupId).then((members: Member[]) => {
        console.log(members);
      });
    });
  }
}
