import React from 'react';
import { storage } from '../firebase';
import './File.css'


const File=(file)=> {

	const [fileURL,setFileURL]= React.useState("");
    // React.useEffect(() => {
    //     storage.ref(file.filePath).getDownloadURL().then((url) => {
	// 		setFileURL(url);
	// 	});
        
    // }, [fileURL])

	

		return (
			<div className="file">
              
				<div className="file-name">File :: {file.fileName}</div>
				{/* <div><a href={"//"+fileURL} target="_blank" rel="noopener noreferrer">{fileURL}</a> */}
			</div>
		);
	
}

export default File;
