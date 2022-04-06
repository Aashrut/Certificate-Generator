const { PDFDocument, rgb} = PDFLib;

const submitBtn = document.getElementById("submit");

submitBtn.addEventListener("click", () => {
	const fname = document.getElementById("fname").value.trim();
	const lname = document.getElementById("lname").value.trim();
	const certType = document.getElementById("certtype").value;
	const eventName = document.getElementById("ename").value.trim();
	const orgName = document.getElementById("oname").value.trim();
	const eventDateArray = new Date(document.getElementById("edate").value).toDateString().split(" ");
	const eventDate = eventDateArray[1] + " " + eventDateArray[2] + ", " + eventDateArray[3];
	const hostName = document.getElementById("hname").value.trim();
	const hostPosition = document.getElementById("hpos").value.trim();
	const orgLogoElement = document.getElementById("ologo").files[0];
	const orgLogoName = orgLogoElement.name;
	const hostSignElement = document.getElementById("hsign").files[0];
	const hostSignName = hostSignElement.name;

	const name = fname + " " + lname;

	const data = {
		"name" : name,
		"certType" : certType,
		"eventName" : eventName,
		"orgName" : orgName,
		"eventDate" : eventDate,
		"hostName" : hostName,
		"hostPosition" : hostPosition,
		"orgLogoName" : orgLogoName,
		"hostSignName" : hostSignName,
		"certDate" : new Date()
	}

	getBase64(orgLogoElement).then(
		d => {
			data["orgLogoDataUrl"] = d;
		}
	);

	getBase64(hostSignElement).then(
		d => {
			data["hostSignDataUrl"] = d;
		}
	);

	generateCertificate(data);

});

// Convert Image Input into base64 Url
function getBase64(file) {
	return new Promise((resolve, reject) => {
	  const reader = new FileReader();
	  reader.readAsDataURL(file);
	  reader.onload = () => resolve(reader.result);
	  reader.onerror = error => reject(error);
	});
}

// Function Implementing PDF-Lib to generate certificate
const generateCertificate = async (data) => {
    const existingPdfBytes = await fetch("./cert-template.pdf").then((res) => res.arrayBuffer());

    // Load a PDFDocument from the existing PDF bytes
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    pdfDoc.registerFontkit(fontkit);

	// Get font
	const BRfontBytes = await fetch("BeauRivage-Regular.ttf", {origin: "*"}).then((res) => res.arrayBuffer());
	const PFDRfontBytes = await fetch("PlayfairDisplay-Regular.ttf", {origin: "*"}).then((res) => res.arrayBuffer());
	const PFDBfontBytes = await fetch("PlayfairDisplay-Bold.ttf", {origin: "*"}).then((res) => res.arrayBuffer());
	const OSfontBytes = await fetch("OpenSans-Regular.ttf", {origin: "*"}).then((res) => res.arrayBuffer());

	// Embed our custom font in the document
	const BeauRivage  = await pdfDoc.embedFont(BRfontBytes);
	const PlayfairDisplayRegular = await pdfDoc.embedFont(PFDRfontBytes);
	const PlayfairDisplayBold = await pdfDoc.embedFont(PFDBfontBytes);
	const OpenSans = await pdfDoc.embedFont(OSfontBytes);

	let descriptionText1 = "For Participating in " + data.eventName + " held by ";
	let descriptionText2 = data.orgName + " on " + data.eventDate + ".";
	let title = "Certificate of Participation";
	let awardingText = "Eventoria is proud to award this certificate to";

	if (data.certType === "Winner") {
		descriptionText1 = "For Participating and Winning in " + data.eventName + " held by ";
		title = "Certificate of Achievement";
	}

	// Get the Width of the various texts with respect corresponding to fonts and size
	const nameWidth = BeauRivage.widthOfTextAtSize(data.name, 55);
	const description1Width = OpenSans.widthOfTextAtSize(descriptionText1, 17);
	const description2Width = OpenSans.widthOfTextAtSize(descriptionText2, 17);
	const titleWidth = PlayfairDisplayRegular.widthOfTextAtSize(title, 30);
	const awardingTextWidth = OpenSans.widthOfTextAtSize(awardingText, 17);
	const hostNameWidth = PlayfairDisplayBold.widthOfTextAtSize(data.hostName, 20);
	const hostPositionWidth = PlayfairDisplayRegular.widthOfTextAtSize(data.hostPosition, 20);

	// Get the height of the texts
	// const textHeight = BeauRivage.heightAtSize(textSize);

	// Arrays for Image name
	const orgLogoNameArray = data.orgLogoName.toLowerCase().split(".");
	const hostSignNameArray = data.hostSignName.toLowerCase().split(".");

	// Get the first page of the document
	const pages = pdfDoc.getPages();
	const page = pages[0];
	
	// Draw organization's Logo
	// Check the extension of the image and draw according to it
	// "page.getWidth() / 2 - someWidth / 2" is used to center the text
	if (orgLogoNameArray[orgLogoNameArray.length - 1] === "jpg" || orgLogoNameArray[orgLogoNameArray.length - 1] === "jpeg") {
		const jpgImage = await pdfDoc.embedJpg(data.orgLogoDataUrl);
		const jpgDims = jpgImage.scale(110 / jpgImage.scale(1).width);
		page.drawImage(jpgImage, {
			x: 670,
			y: 410,
			width: jpgDims.width,
			height: jpgDims.height,
		});
	}
	else if (orgLogoNameArray[orgLogoNameArray.length - 1] === "png"){
		const pngImage = await pdfDoc.embedPng(data.orgLogoDataUrl);
		const pngDims = pngImage.scale(110 / pngImage.scale(1).width);
		page.drawImage(pngImage, {
			x: 670,
			y: 410,
			width: pngDims.width,
			height: pngDims.height,
		});
	}

	// Draw event host's sign
	// Check the extension of the image and draw according to it
	if (hostSignNameArray[hostSignNameArray.length - 1] === "jpg" || hostSignNameArray[hostSignNameArray.length - 1] === "jpeg") {
		const jpgImage = await pdfDoc.embedJpg(data.hostSignDataUrl);
		const jpgDims = jpgImage.scale(100 / jpgImage.scale(1).width);
		page.drawImage(jpgImage, {
			x: page.getWidth() / 2 - jpgDims.width / 2,
			y: 115,
			width: jpgDims.width,
			height: jpgDims.height,
		});
	}
	else if (hostSignNameArray[hostSignNameArray.length - 1] === "png"){
		const pngImage = await pdfDoc.embedPng(data.hostSignDataUrl);
		const pngDims = pngImage.scale(100 / pngImage.scale(1).width);
		page.drawImage(pngImage, {
			x: page.getWidth() / 2 - pngDims.width / 2,
			y: 115,
			width: pngDims.width,
			height: pngDims.height,
		});
	}

	page.drawText(title, {
		x: page.getWidth() / 2 - titleWidth / 2,
		y: 460,
		size: 30,
		font: PlayfairDisplayRegular,
		color: rgb(1, 1, 1),
	});

	page.drawText(awardingText, {
		x: page.getWidth() / 2 - awardingTextWidth / 2,
		y: 400,
		size: 17,
		font: OpenSans,
		color: rgb(1, 1, 1),
	});

	page.drawText(data.name, {
		x: page.getWidth() / 2 - nameWidth / 2,
		y: 330,
		size: 55,
		font: BeauRivage,
		color: rgb(1, 1, 1),
	});

	page.drawText(descriptionText1, {
		x: page.getWidth() / 2 - description1Width / 2,
		y: 270,
		size: 17,
		font: OpenSans,
		color: rgb(1, 1, 1),
	});

	page.drawText(descriptionText2, {
		x: page.getWidth() / 2 - description2Width / 2,
		y: 245,
		size: 17,
		font: OpenSans,
		color: rgb(1, 1, 1),
	});

	page.drawText(data.hostName, {
		x: page.getWidth() / 2 - hostNameWidth / 2,
		y: 80,
		size: 20,
		font: PlayfairDisplayBold,
		color: rgb(1, 1, 1),
	});

	page.drawText(data.hostPosition, {
		x: page.getWidth() / 2 - hostPositionWidth / 2,
		y: 50,
		size: 20,
		font: PlayfairDisplayRegular,
		color: rgb(1, 1, 1),
	});

	// Set the PDF Meta Data
	pdfDoc.setTitle(data.name + " " + data.eventName + " Certificate");
	pdfDoc.setAuthor('Eventoria');
	pdfDoc.setSubject(data.name + " " + data.eventName + " Certificate");
	pdfDoc.setKeywords(['eventoria', 'certificate'])
	pdfDoc.setCreator('pdf-lib (https://github.com/Hopding/pdf-lib)')
	pdfDoc.setCreationDate(data.certDate);
 
	// Serialize the PDFDocument to bytes (a Uint8Array)
	const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
	saveAs(pdfDataUri, data.name.replace(" ", "_") + "_certificate.pdf")
}