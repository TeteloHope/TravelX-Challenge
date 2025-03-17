//class associated with registering user
// export class User {
//     idNumber!: string;
//     emailaddress!: string;
//     password!: string;
//   }

export class User {
  emailaddress: string = '';
  password: string = '';
}

export interface User {
  emailaddress: string;
  password: string; 
}
  