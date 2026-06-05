
export class ApiResponse {

  static successList(res: any, data: any, message = "Operação realizada com sucesso") {
    return res.status(200).json({
      ...data,                    
      message                   
    });
  }

  static success(res: any, message: string, data: any = null, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      ...(data && { data })
    });
  }

  static error(res: any, message: string, errorCode?: string, statusCode = 400) {
    return res.status(statusCode).json({
      success: false,
      message,
      error: errorCode || message.toUpperCase().replace(/ /g, '_')
    });
  }
}

export default ApiResponse;