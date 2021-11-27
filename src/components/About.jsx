//to display about information on the Home Page
export const About = (props) => (
  <div id="about">
    <div className="container">
      <div className="row">
        <div className="col-xs-12 col-md-6">
          {" "}
          <img
            src="https://1.bp.blogspot.com/-4f25Fe3iuDI/XnyfCwfU24I/AAAAAAAAGSo/8rnBh9oy5Xkjj22BbayhXrR_TA8neNpPgCLcBGAsYHQ/s1600/KamiForRemoteLearning_Blog_1200x800px-1.jpg"
            className="img-responsive"
            alt=""
          />{" "}
        </div>
        <div className="col-xs-12 col-md-6">
          <div className="about-text">
            <h2>About the Project</h2>
            <p>{props.data ? props.data.paragraph : "loading..."}</p>
            <h3>About me</h3>
            <div className="list-style">
              <div className="col-lg-12 col-sm-12 col-xs-12">
                <ul>
                  {props.data
                    ? props.data.Why.map((d, i) => (
                        <li key={`${d}-${i}`}>{d}</li>
                      ))
                    : "loading"}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
