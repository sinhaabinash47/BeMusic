import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'faqs',
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaqsComponent implements OnInit {

    general: any = [{id:1,question:'What are Record Pools and why join Ours?',answer:{para:['Record Pools are a promotional music service for professional DJs where the content is delivered downloaded in MP3 format. DJ Mixing Lab provides professional DJs the best platform to find and download all the latest music.']}},

    {id:2,question:'What music genres are available for download?',para:[],
    answer:{
       generes:["AFRO HOUSE","AFROBEAT","BACHATA","BIG ROOM EDM","BRAZILIAN FUNK","CLASSIC DANCE","COUNTRY",
   "CUBATON", "CUMBIA","DANCE POP" ,"DEEP HOUSE - LOUNGE" ,"DEMBOW" ,"DISCO – FUNK" ,"ELECTRO - FUTURE PROGRESSIVE HOUSE" ,
   "ELECTRO POP" ,"ELECTRONIC CLASSICS" ,"FREESTYLE" ,"GUARACHA" ,"HIP-HOP" ,"HIP-HOP 90&#39;S - 2K" ,"HIP-HOP CLASSIC" ,
   "HOUSE" ,"LATIN DANCE" ,"LATIN HOUSE" ,"LATIN MOOMBAHTON" ,"LATIN POP" ,"LATIN TECH" ,"LATIN TRAP" ,"MERENGUE – MAMBO" ,
   "MEXICAN" ,"MIAMI BASS" ,"MINIMAL - TECH" ,"MOOMBAHTON" ,"NU DISCO" ,"OLDIES" ,"POP" ,"POP CLASSIC" ,"R&amp;B" ,"R&amp;B 90&#39;S - 2K" ,
   "R&amp;B CLASSIC" ,"REGGAE – DANCEHALL" ,"REGGAETON" ,"RETRO - NEW WAVE" ,"ROCK" ,"ROCK CLASSIC" , "SALSA" ," SOULFUL HOUSE" ,
   "SPANISH ROCK" , "TRAP - DRILL" , "TRIBAL HOUSE" , "TRIP-HOP" , "TROPICAL HOUSE" ," VALLENATO" ],

  subgeneres:["ACAPELLA"," ACAPELLA IN OUT"," CLAP INTRO"," HYPE EDIT","LOOPS","MASHUP"," PARTY BREAK"," RE-DRUM","SAMPLES",
  "SEGWAY – WORD TONE PL","SLAM INTRO"," TRANSITION DOWN","TRANSITION UP"]
}},
    {id:3,question:'What are the types of content delivery available?',answer:{para:['Our content is delivered through downloads as MP3 files.']}},
    {id:4,question:'How often is new content available?',answer:{para:['We release music files daily.']}},
    {id:5,question:'Can downloaded music be kept?',answer:{para:['Yes.']}},
    {id:6,question:'Where is your download history?',answer:{para:['Find your downloaded music history.'], link:'/web/account'}},
    {id:7,question:'What is the downloading limit?',answer:{para:['We have a limit of 3 downloads per file to prevent users sharing their account.']}},
    {id:8,question:'How to submit music?',answer:{para:['Record Labels, Artists, Re-Mixers and Editors can submit tracks for consideration.'], link:'/tracks/new'}},
    {id:9,question:'How to contact us?',answer:{para:['Approved members can contact us.'], link:'/web/contact'}},
    {id:10,question:'Can applicants preview the music library before subscribing to a membership?',answer:{para:['Yes. Approved members can preview any track for up to 2 minutes.']}},
    {id:11,question:'How to join?',answer:{para:['Professional DJs can apply for membership.'], link:'/register'}},
    ]



   billing: any = [{id:1,question:'What is the membership cost?',answer:{para:['Subscription pricing'], link:'/web/account'}},

        {id:3,question:'What payment forms do we accept?',answer:{para:['All Major Credit Cards and Paypal.']}},
        {id:4,question:'How often is new content available?',answer:{para:['We release music files daily.']}},
        {id:5,question:'How to change or cancel your membership plan?',answer:{para:['change or cancel your membership plan.'], link:'/web/account'}},
        {id:6,question:'How to update billing information?',answer:{para:['Update Billing Information.'], link:'/web/account'}},
        {id:7,question:'How to dispute billing issues or request a refund?',answer:{para:['Create a support ticket.'], link:'/web/account'}},
        {id:8,question:'How to renew membership?',answer:{para:['Renew membership.'], link:'/web/account'}},
        {id:9,question:'When do memberships automatically bill?',answer:{para:['Depending on the membership type. Monthly, Quarterly or Yearly.']}},
        {id:10,question:'What if I can’t purchase or change my membership plan?',answer:{para:['Create a support ticket.'], link:'/web/account'}},
        {id:11,question:'Where to find your invoices?',answer:{para:['Find your invoice Here.'], link:'/web/account'}},]


  technical: any = [{id:1,question:'What is the format and quality of the music library?',answer:{para:['Our music library has the highest quality of MP3’s at 320kbps. All Music Files have the Artist, Title, Bpm, Key &amp; Genre properly filled inside the ID3 Meta Tag. Our Library is also Serato ready with Cue Points and Beatgrids.']}},

  {id:2,question:'What music software are your files compatible with?',answer:{para:['Our music library is compatible with all DVS software platforms including Serato, Rekordbox and Traktor.']}},

  {id:3,question:'Are search filters available?',para:[],
  answer:{
    enginesystem:["Search – Direct search by artist name or title for music files.",
    "Categories – Genre collection is narrowed down to a specific type of format. (i.e. Dance, Latin and Urban.)",
    "Genres – Specific music genre list.",
    "Sub-Genres – Edits and DJ Tools of genres."],


}},

{id:4,question:'How to change your password?',answer:{para:['Change your password.'], link:'/forgot-password'}},
{id:5,question:'How to request account deletion?',answer:{para:['Submit cancelation request Here.'], link:'/web/account'}},
{id:6,question:'Can’t download music with an active membership?',answer:{para:['Please submit support ticket.'], link:'/web/dashboard'}},
{id:7,question:'How to submit a website error?',answer:{para:['Please submit website errors Here.'], link:'/web/account'}},

{id:8,question:'How to reset browser cache?',para:[],
answer:{
    safari:["Click on the Safari drop-down menu and select Preferences.",
    "Click the Advanced tab. Select the Show Develop menu in menu bar checkbox and close the Preferences window.",
    "Select the Develop drop-down menu. Click Empty Cache.",
    "Note: You may want to also clear your browser history.",],

    chrome:["Click on the Safari drop-down menu and select Preferences.",
    "Click the Advanced tab. Select the Show Develop menu in menu bar checkbox and close the Preferences window.",
    "Select the Develop drop-down menu. Click Empty Cache.",
    "Note: You may want to also clear your browser history.",],

    firefox:["In the Menu bar at the top of the screen, click Firefox and select Preferences.",
    "Select the Privacy &amp; Security panel.",
    "In the Cookies and Site Data section, click Clear Data.",
    "Remove the check mark in front of Cookies and Site Data.",
    "With Cached Web Content check marked, click the Clear button."]
}},

{id:9,question:'What is the Cookie Policy?',answer:{para:['Need to make one.']}},

 ]
    gselected: any;

  constructor(private router: Router,) {
    this.gselected=(this.general.length>0)?1:0;
  }

  ngOnInit(): void {
  }
  generalSelected(id){
    if(this.gselected===id){
        this.gselected=0;
    }else{
        this.gselected=id;
    }
  }

  paraselected(link){
    this.router.navigateByUrl(link)
  }
}
