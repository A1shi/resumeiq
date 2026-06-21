package com.aashi.resumeiq.utils

import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.pdf.PdfDocument
import java.io.ByteArrayOutputStream
import java.io.IOException

fun convertImageToPdf(imageBytes: ByteArray): ByteArray {
    val bitmap = BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size) 
        ?: throw IOException("Failed to decode image bytes. Unsupported format.")
    
    val pdfDocument = PdfDocument()
    val pageInfo = PdfDocument.PageInfo.Builder(bitmap.width, bitmap.height, 1).create()
    val page = pdfDocument.startPage(pageInfo)
    val canvas: Canvas = page.canvas
    canvas.drawBitmap(bitmap, 0f, 0f, null)
    pdfDocument.finishPage(page)
    
    val outputStream = ByteArrayOutputStream()
    pdfDocument.writeTo(outputStream)
    pdfDocument.close()
    bitmap.recycle()
    return outputStream.toByteArray()
}
