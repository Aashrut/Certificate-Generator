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

	const name = fname + " " + lname;

	const data = {
		"name" : name,
		"certType" : certType,
		"eventName" : eventName,
		"orgName" : orgName,
		"eventDate" : eventDate,
		"hostName" : hostName,
		"hostPosition" : hostPosition
	}

	generatePDF(data);

});

const generatePDF = async (data) => {
	console.log(data);
    const existingPdfBytes = await fetch("cert-template.pdf").then((res) => res.arrayBuffer());

    // Load a PDFDocument from the existing PDF bytes
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    pdfDoc.registerFontkit(fontkit);

	//get font
	const BRfontBytes = await fetch("BeauRivage-Regular.ttf", {origin: "*"}).then((res) => res.arrayBuffer());
	const PFDRfontBytes = await fetch("PlayfairDisplay-Regular.ttf", {origin: "*"}).then((res) => res.arrayBuffer());
	const PFDBfontBytes = await fetch("PlayfairDisplay-Bold.ttf", {origin: "*"}).then((res) => res.arrayBuffer());
	const OSfontBytes = await fetch("OpenSans-Regular.ttf", {origin: "*"}).then((res) => res.arrayBuffer());

	// Embed our custom font in the document
	const BeauRivage  = await pdfDoc.embedFont(BRfontBytes);
	const PlayfairDisplayRegular = await pdfDoc.embedFont(PFDRfontBytes);
	const PlayfairDisplayBold = await pdfDoc.embedFont(PFDBfontBytes);
	const OpenSans = await pdfDoc.embedFont(OSfontBytes);

	const nameWidth = BeauRivage.widthOfTextAtSize(data.name, 55);
    // const textHeight = BeauRivage.heightAtSize(textSize);

	let descriptionText1 = "For Participating in " + data.eventName + " held by ";
	let descriptionText2 = data.orgName + " on " + data.eventDate + ".";
	let title = "Certificate of Participation";

	if (data.certType === "Winner") {
		descriptionText1 = "For Participating and Winning in " + data.eventName + " held by ";
		title = "Certificate of Achievement";
	}

	const description1Width = OpenSans.widthOfTextAtSize(descriptionText1, 17);
	const description2Width = OpenSans.widthOfTextAtSize(descriptionText2, 17);
	const titleWidth = PlayfairDisplayRegular.widthOfTextAtSize(title, 30);

	const hostNameWidth = PlayfairDisplayBold.widthOfTextAtSize(data.hostName, 20);
	const hostPositionWidth = PlayfairDisplayRegular.widthOfTextAtSize(data.hostPosition, 20);

	// Get the first page of the document
	const pages = pdfDoc.getPages();
	const page = pages[0];

	// Draw a string of text diagonally across the first page
	page.drawText(title, {
		x: page.getWidth() / 2 - titleWidth / 2,
		y: 460,
		size: 30,
		font: PlayfairDisplayRegular,
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
		y: 90,
		size: 20,
		font: PlayfairDisplayBold,
		color: rgb(1, 1, 1),
	});

	page.drawText(data.hostPosition, {
		x: page.getWidth() / 2 - hostPositionWidth / 2,
		y: 60,
		size: 20,
		font: PlayfairDisplayRegular,
		color: rgb(1, 1, 1),
	});
 
	// Serialize the PDFDocument to bytes (a Uint8Array)
	const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
	saveAs(pdfDataUri,"newcertificate.pdf")
}