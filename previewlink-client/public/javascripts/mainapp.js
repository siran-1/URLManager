class URLManager {
    constructor(data) {
        this.userData = new Map(); // Using Map for better structure and performance
        for(let[key,values] of Object.entries(data)){
            this.userData.set(key,values);
        }
      for(let item of this.userData.keys()){
        this.foldermaker('old',{foldername : item})
      }  
    }

// create folder
    foldermaker(source,data){
        let folder = document.createElement('div');
        folder.className = 'manager-folder';
        folder.id = data.foldername;
        folder.setAttribute('foldername',data.foldername);
        folder.setAttribute('onclick', `openfolder("${data.foldername}")`);
    
        folder.setAttribute('newfolder', source == "new" ? true : false);
    
        let folderimg = document.createElement('img');
        folderimg.className = 'manager-folder-thumbnail';
        folderimg.src = "../images/—Pngtree—vector folder icon_3762805.png";
    
        let foldertitle = document.createElement('label');
        foldertitle.className = 'manager-folder-title';
        foldertitle.innerText = data.foldername;
    
        folder.appendChild(folderimg);
        folder.appendChild(foldertitle);
    
        let managerdisplaydiv = document.getElementById('manager-display');
        managerdisplaydiv.appendChild(folder);
    }

// open folder - model
    openfolder(foldername){
        console.log(foldername);
        this.currentopenfolder = foldername;
        $('#linkfolder').modal('show');
        this.renderurls(foldername);
    }

// adding url to the folder
    fetchurlcontent(){
    let url = document.getElementById('UrlSource').value;
    let category = this.currentopenfolder;

    fetch('http://urlmanager.us-east-1.elasticbeanstalk.com/preview', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Client-App': 'true' // Custom header to indicate request from client app
        },
        body: JSON.stringify({ url: url, user: user, category: category }) 
    })
    .then((response) => {
        if (!response.ok) {
            // If the response is not OK, throw an error with the status text
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json(); // Only parse and proceed if the response was OK
    })
    .then((data) => {
        this.userData.has(category) ? this.userData.get(category).push(data.previewContent) :
        this.userData.set(category,[data.previewContent]);
        console.log(this.userData);
        this.renderurls(category);
    })
    .catch((err) => {
        console.log(err);
    });   
    }

    renderurls(folder){
        let urls = this.userData.get(folder);
        let folderdiv = document.getElementById('linkfolder-body');
        folderdiv.innerHTML = "";

        urls.forEach((url)=>{
        let urldiv = document.createElement('div');
        urldiv.className = 'folder-child-div mt-2 bg-light shadow-sm rounded'

        // creating image
         let image = document.createElement('img');
         image.src = url.linkimage;
         image.className = 'previewimage rounded'
         urldiv.appendChild(image); //adding image to previewdiv
        
         let rightdiv = document.createElement('div');
         rightdiv.className = 'url-right-div'

         let title = document.createElement('h3'); // creating title
         title.innerText = url.linktitle;
         title.className = 'previewtitle';
         rightdiv.appendChild(title);//adding title to nested child div

         let description = document.createElement('p'); //creating description
         description.innerText = url.linkdescription;
         description.className = 'previewdesc';
         rightdiv.appendChild(description); // adding description to nested child div
         urldiv.appendChild(rightdiv);
         
         let clickurl = document.createElement('a');
         clickurl.href = url.link;
         clickurl.innerText = url.link;
         rightdiv.appendChild(clickurl)

        folderdiv.appendChild(urldiv); //adding nested child div to previewdiv
        })   
    }
}

let urlmanager = new URLManager(userdata);

document.getElementById('folder-add-btn').onclick = () => {
    let foldername = prompt('Please enter folder name!','untitled');
    urlmanager.foldermaker(source='new',{foldername})
}

function openfolder(foldername){
    urlmanager.openfolder(foldername);
}

function addurl(){
    urlmanager.fetchurlcontent();
}

// feedback API
let feedbackManager = new Feedbackmanager();
function Feedbackmanager() {
    // set and reset rating
    this.rating = (rating) => {
      const btnarray = document.querySelectorAll("button.feedbackbtn-group");
      if(rating=='reset'){
        for (let i = 0; i < btnarray.length; i++) {
          btnarray[i].removeAttribute('disabled');
        }
      }
      else{
        for (let i = 0; i < rating; i++) {
          btnarray[i].setAttribute('disabled',true);
        }
          return this.ratevalue = rating;
      } 
    };

    // feedback submission
    this.submitfeedback = ({id,comment}) => {
      fetch(`http://getfeedbacksapp-nvcex.eba-swsxwfmq.us-east-1.elasticbeanstalk.com/api/v1/feedbacks/${id}`,{
        method:'POST',
       headers:{
        "Content-Type": "application/json"
       },
       body: JSON.stringify({ comment,rating:this.ratevalue}),
      }).then((response)=>{
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data)=>{
        document.getElementById('feedback-comment').value = '';
        this.rating('reset');
      })
      .catch((error)=>console.log(error))
    };
  }
  
  function rating(ev, rating) {
    feedbackManager.rating(rating);
  }
  
  function feedbacksubmit(){
    let result;
    let comment = document.getElementById('feedback-comment').value;
    let questionid = '2ce33721-292e-4776-8581-23244b32445e';

    feedbackManager.ratevalue ? result = feedbackManager.submitfeedback({id:questionid,comment}) : (()=>{
      document.getElementById('ratingrequesttext').removeAttribute('hidden');
      setTimeout(()=>{
        document.getElementById('ratingrequesttext').setAttribute('hidden',true);
      },"1000");
    })();
  }

  // random quote api
  fetch('http://apiquotes-env.eba-e89agpmj.us-east-1.elasticbeanstalk.com/quotes')
  .then((response) => {return response.json()}).then(data => {
    document.getElementById('quote').innerText = Object.keys(data) + "\n Quote By: " + Object.values(data);
  });


  document.getElementById('logout').onclick = () =>{
    fetch('/logout').then((res)=> res.json()).then((data)=>  window.location.href = '/')
  };