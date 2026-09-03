import type { ImageMetadata } from 'astro';
import acer1 from '../assets/images/products/acer-1.webp';
import acer2 from '../assets/images/products/acer-2.webp';
import acer3 from '../assets/images/products/acer-3.webp';
import lenovo1 from '../assets/images/products/lenovo-1.webp';
import lenovo2 from '../assets/images/products/lenovo-2.webp';
import msi1 from '../assets/images/products/msi-1.webp';
import msi2 from '../assets/images/products/msi-2.webp';
import msi3 from '../assets/images/products/msi-3.webp';
import msi4 from '../assets/images/products/msi-4.webp';
import macbook1 from '../assets/images/products/macbook-1.webp';
import macbook2 from '../assets/images/products/macbook-2.webp';
import insta1 from '../assets/images/products/insta360-1.webp';
import insta2 from '../assets/images/products/insta360-2.webp';
import insta3 from '../assets/images/products/insta360-3.webp';
import desktop1 from '../assets/images/products/desktop-1.webp';
import desktop2 from '../assets/images/products/desktop-2.webp';
import desktop3 from '../assets/images/products/desktop-3.webp';

export interface ProductPhoto { image: ImageMetadata; alt: string; caption: string; slotId: string; }
const photo=(image:ImageMetadata,caption:string,slotId:string):ProductPhoto=>({image,alt:caption,caption,slotId});
export const PRODUCT_PHOTOS={
 acer:[photo(acer1,'Acer Swift สีเงิน มุมด้านหน้า เห็นหน้าจอและคีย์บอร์ด','PHOTO-ACER-1'),photo(acer2,'Acer Swift สีเงิน มุมฝาหลังและพอร์ตด้านข้าง','PHOTO-ACER-2'),photo(acer3,'Acer Swift สีม่วง มุมเปิดหน้าจอ','PHOTO-ACER-3')],
 lenovo:[photo(lenovo1,'โน้ตบุ๊ก Lenovo สีเงิน มุมหน้าจอและแป้นตัวเลข','PHOTO-LENOVO-1'),photo(lenovo2,'โน้ตบุ๊ก Lenovo มุมด้านข้าง เห็นบานพับและพอร์ต','PHOTO-LENOVO-2')],
 msi:[photo(msi1,'โน้ตบุ๊กเกมมิ่ง MSI เปิดหน้าจอและไฟคีย์บอร์ด','PHOTO-MSI-1'),photo(msi2,'โน้ตบุ๊ก MSI มุมฝาหลังและช่องระบายอากาศ','PHOTO-MSI-2'),photo(msi3,'พอร์ตด้านข้างโน้ตบุ๊ก MSI สำหรับถ่ายประกอบการแจ้งสภาพ','PHOTO-MSI-3'),photo(msi4,'โน้ตบุ๊กเกมมิ่ง MSI มุมตรงด้านหน้า','PHOTO-MSI-4')],
 macbook:[photo(macbook1,'MacBook Air M3 มุมเปิดหน้าจอและคีย์บอร์ด','PHOTO-MACBOOK-1'),photo(macbook2,'MacBook Air M3 มุมฝาหลังและขอบตัวเครื่อง','PHOTO-MACBOOK-2')],
 insta360:[photo(insta1,'กล้อง Insta360 X5 พร้อมกล่องที่เปิดให้เห็นตัวกล้อง','PHOTO-INSTA360-1'),photo(insta2,'กล่อง Insta360 X5 ระบุรุ่น 8K 360 Action Cam','PHOTO-INSTA360-2'),photo(insta3,'Insta360 X5 มุมใกล้ เห็นเลนส์ หน้าจอ และตัวเครื่อง','PHOTO-INSTA360-3')],
 desktop:[photo(desktop1,'คอมตั้งโต๊ะเคสสีขาว เห็นการ์ดจอและพัดลมภายใน','PHOTO-DESKTOP-1'),photo(desktop2,'คอมตั้งโต๊ะเคสสีดำ มุมด้านข้างเห็นการ์ดจอ GeForce RTX','PHOTO-DESKTOP-2'),photo(desktop3,'คอมตั้งโต๊ะเคสสีดำ มุมด้านหน้าและด้านข้าง','PHOTO-DESKTOP-3')],
};
export type ProductPhotoGroup=keyof typeof PRODUCT_PHOTOS;
// Explicit routes prevent a photo of one model being presented as another model.
export const PHOTO_ROUTES:Record<string,ProductPhotoGroup[]>={
 '/':['macbook','acer','lenovo','msi','insta360','desktop'],
 '/รับซื้อโน๊ตบุ๊ค-โคราช':['acer','lenovo','msi','macbook'],
 '/รับซื้อโน๊ตบุ๊ค-acer-โคราช':['acer'],
 '/รับซื้อโน๊ตบุ๊ค-acer-swift-โคราช':['acer'],
 '/รับซื้อโน๊ตบุ๊ค-lenovo-โคราช':['lenovo'],
 '/รับซื้อโน๊ตบุ๊ค-msi-โคราช':['msi'],
 '/รับซื้อโน๊ตบุ๊คเกมมิ่ง-โคราช':['msi'],
 '/รับซื้อ-macbook-โคราช':['macbook'],
 '/รับซื้อ-macbook-air-m3-โคราช':['macbook'],
 '/รับซื้อคอมพิวเตอร์-โคราช':['desktop'],
 '/รับซื้อคอมตั้งโต๊ะ-โคราช':['desktop'],
 '/รับซื้อคอมเกมมิ่ง-โคราช':['desktop'],
 '/รับซื้อกล้อง-โคราช':['insta360'],
 '/บทความ/วิธีถ่ายรูปสินค้าไอทีเพื่อให้ประเมินราคาได้เร็ว':['acer','insta360','desktop'],
 '/บทความ/วิธีเช็กสเปกโน๊ตบุ๊คก่อนส่งประเมิน':['lenovo'],
 '/บทความ/วิธีดูรุ่น-macbook-ก่อนขาย':['macbook'],
 '/บทความ/cycle-count-และ-activation-lock-ก่อนขาย-macbook':['macbook'],
 '/บทความ/วิธีแพ็กคอมตั้งโต๊ะก่อนส่ง':['desktop'],
 '/บทความ/วิธีทดสอบคีย์บอร์ดโน๊ตบุ๊คก่อนขาย':['msi'],
 '/บทความ/เตรียมโน๊ตบุ๊คก่อนขายอย่างไร':['acer'],
};
export const photoGroupsForPath=(path:string)=>PHOTO_ROUTES[decodeURIComponent(path).replace(/\/$/,'')||'/']??[];
export const photoCoverForPath=(path:string)=>PRODUCT_PHOTOS[photoGroupsForPath(path)[0]]?.[0];
