export class Response{
  private statusCode: number
  private message: string
  private data: object

  constructor(statusCode: number, message: string, data: object){
    this.statusCode = statusCode;
    this.message = message;
    this.data = data
  }
}