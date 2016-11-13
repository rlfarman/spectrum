import React, { Component } from 'react';
import { Modal,
         Button,
         FormGroup,
         FormControl,
         ControlLabel,
         Checkbox,
         Panel,
         Alert } from 'react-bootstrap';
import firebase from 'firebase';

class CreateUser extends Component {
  static getValidation(str) {
    const pattern = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}[.]{0,1}/;
    if (!pattern.test(str)) {
      return 'error';
    }
    return 'success';
  }

  static handleTags(tags) {
    const regexp = /(\s|^)\w\w+\b/gm;
    let result = tags.match(regexp);
    if (result) {
      result = result.map(s => s.trim());
      return result.slice(0, 10);
    } return null;
  }

  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      description: '',
      tags: '',
      type: 'student',
      skills: {
        frontend: false,
        backend: false,
        design: false,
        research: false,
        outreach: false,
        media: false,
      },
      website: '',
      github: '',
      githubValid: '',
      websiteValid: '',
      invalid: null,
    };
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.getGithubValidation = this.getGithubValidation.bind(this);
    this.getWebsiteValidation = this.getWebsiteValidation.bind(this);
    this.getValidation = this.getValidation.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
    this.handleTags = this.handleTags.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  getGithubValidation() {
    const github = this.state.github;
    if (this.getValidation(github) === 'success') {
      if (github.indexOf('github') > -1) {
        return 'success';
      } return 'warning';
    } return 'error';
  }

  getWebsiteValidation() {
    const website = this.state.website;
    if (this.getValidation(website) === 'success') {
      return 'success';
    }
    return 'error';
  }

  close() {
    this.setState({ showModal: false });
  }

  open() {
    this.setState({ showModal: true });
  }
  handleChange(key) {
    return (e) => {
      const state = {};
      state[key] = e.target.value;
      this.setState(state);
    };
  }

  handleCheck(key) {
    return () => {
      const skills = this.state.skills;
      skills[key] = !this.state.skills[key];
      this.setState({ skills });
    };
  }

  handleSubmit() {
    const user = firebase.auth().currentUser;
    if (user != null) {
      const tags = this.handleTags(this.state.tags);
      const skills = Object.keys(this.state.skills)
                           .filter(key => this.state.skills[key]);
      if (!this.state.description === '' || tags === [] || !skills === []) {
        this.setState({ invalid: true });
        return;
      }
      user.providerData.forEach((profile) => {
        const userData = {
          provider: profile.providerId,
          userId: profile.uid,
          email: profile.email,
          name: profile.displayName,
          photo: profile.photoURL,
          description: this.state.description,
          tags,
          type: this.state.type,
          skills,
          website: this.state.website,
          github: this.state.github,
          created: firebase.database.ServerValue.TIMESTAMP
        };
        const updates = {};
        updates['/users/ ${user.uid}'] = userData;
        firebase.database().ref().update(updates);
        this.close();
      });
    }
  }

  render() {
    return (
      <div>
        <Button
            bsStyle="primary"
            bsSize="small"
            onClick={this.open}
        >
          Create User
        </Button>

        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>Create a User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h4>Enter your information</h4>
            <form>
              <FormGroup controlId="formControlsSelect">
                <ControlLabel>Enter a description</ControlLabel>
                <FormControl
                    componentClass="textarea"
                    placeholder="Description"
                    onChange={this.handleChange('description')}
                />
              </FormGroup>
              <FormGroup controlId="formControlsSelect">
                <ControlLabel>Enter tags</ControlLabel>
                <FormControl
                    type="text"
                    placeholder="Tags"
                    onChange={this.handleChange('tags')}
                />
              </FormGroup>
              <FormGroup controlId="formControlsSelect">
                <ControlLabel>Choose a type</ControlLabel>
                <FormControl
                    componentClass="select"
                    placeholder="Type"
                    onChange={this.handleChange('type')}
                >
                  <option value="student">Student</option>
                  <option value="professional">Professional</option>
                </FormControl>
              </FormGroup>
              <FormGroup
                  controlId="formBasicText"
                  validationState={this.getGithubValidation()}
              >
                <ControlLabel>Github</ControlLabel>
                <FormControl
                    type="text"
                    value={this.state.github}
                    placeholder="Enter github"
                    onChange={this.handleChange('github')}
                />
                <FormControl.Feedback />
              </FormGroup>
              <FormGroup
                  controlId="formBasicText"
                  validationState={this.getWebsiteValidation()}
              >
                <ControlLabel>Website</ControlLabel>
                <FormControl
                    type="text"
                    value={this.state.website}
                    placeholder="Enter a valid website url"
                    onChange={this.handleChange('website')}
                />
                <FormControl.Feedback />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Skills</ControlLabel>
                <Panel>
                  <Checkbox onChange={this.handleCheck('frontend')}>
                    Developer - Front End
                  </Checkbox>
                  {' '}
                  <Checkbox onChange={this.handleCheck('backend')}>
                    Developer - Back End
                  </Checkbox>
                  {' '}
                  <Checkbox onChange={this.handleCheck('design')}>
                    Designer
                  </Checkbox>
                  {' '}
                  <Checkbox onChange={this.handleCheck('media')}>
                    Media
                  </Checkbox>
                  {' '}
                  <Checkbox onChange={this.handleCheck('research')}>
                    Research
                  </Checkbox>
                  {' '}
                  <Checkbox onChange={this.handleCheck('outreach')}>
                    Outreach
                  </Checkbox>
                </Panel>
              </FormGroup>
            </form>
          </Modal.Body>
          <Modal.Footer>
            {this.state.invalid &&
            <Alert bsStyle="warning">
              Submission denied, check that all forms are valid.
            </Alert>
            }
            <Button bsStyle="primary" onClick={this.handleSubmit}>Submit</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default CreateUser;
