import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { PasswordAuthViews } from '../components/smart/auth';
import Title from '../components/dumb/title';
import Subtitle from '../components/dumb/subtitle';
import Loading from '../components/dumb/loading';
import Alert from '../components/dumb/alert';

//------------------------------------------------------------------------------
// COMPONENT STATES:
//------------------------------------------------------------------------------
const STATES = {
  resetPassword: {
    title: 'Reset your Password',
    // subtitle: '',
    // linkTo: '',
    // linkLabel: '',
    btnLabel: 'Reset Password',
  },
  forgotPassword: {
    title: 'Forgot your Password?',
    subtitle: `
      We&apos;ll send a link to your email to reset<br />
      your password and get you back on track.
    `,
    // linkTo: '',
    // linkLabel: '',
    btnLabel: 'Send Link',
  },
};
//------------------------------------------------------------------------------
// COMPONENT:
//------------------------------------------------------------------------------
class ResetPasswordPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: 'resetPassword',
      disabled: false,
      errorMsg: '',
      successMsg: '',
    };
    this.enableBtn = this.enableBtn.bind(this);
    this.disableBtn = this.disableBtn.bind(this);
    this.clearMessages = this.clearMessages.bind(this);
    this.changeViewTo = this.changeViewTo.bind(this);
    this.handleBefore = this.handleBefore.bind(this);
    this.handleClientError = this.handleClientError.bind(this);
    this.handleServerError = this.handleServerError.bind(this);
    this.handleSucess = this.handleSucess.bind(this);
  }

  enableBtn() {
    this.setState({ disabled: false });
  }

  disableBtn() {
    this.setState({ disabled: true });
  }

  clearMessages() {
    this.setState({ errorMsg: '', successMsg: '' });
  }

  changeViewTo(to) {
    return (evt) => {
      evt.preventDefault();
      this.clearMessages();
      this.setState({ view: to });
    };
  }

  handleBefore() {
    // OBSERVATION: this hook allows you to trigger some action(s)
    // before the login request is sent or simply interrupt the normal
    // login flow by throwing an error.
    this.disableBtn();
    this.clearMessages();
  }

  handleClientError(err) {
    console.log(err);
    this.enableBtn();
  }

  handleServerError(err) {
    console.log(err);
    this.setState({ errorMsg: err.reason || err.message || 'Unexpected error' });
    this.enableBtn();
  }

  handleSucess() {
    const { view } = this.state;
    const { history } = this.props;

    switch (view) {
      case 'resetPassword': {
        this.enableBtn();
        const handler = Meteor.setTimeout(() => {
          alert('Password reset successfully!');
          Meteor.clearTimeout(handler);
        }, 1000);
        history.push('/');
        break;
      }
      case 'forgotPassword':
        this.enableBtn();
        this.setState({ successMsg: 'A new email has been sent to your inbox!' });
        break;
      default:
        throw new Error('Unknown view option!');
    }
  }

  render() {
    const { match: { params: { token } } } = this.props;
    const { view, disabled, errorMsg, successMsg } = this.state;
    const { title, subtitle, linkTo, linkLabel, btnLabel } = STATES[view];

    return (
      <div>
        <Title>{title}</Title>
        {view === 'forgotPassword' && (
          <Subtitle
            text={subtitle}
            linkTo={linkTo}
            linkLabel={linkLabel}
            onLinkClick={this.changeViewTo(linkTo)}
          />
        )}
        <PasswordAuthViews
          view={view}
          btnLabel={btnLabel}
          token={token}
          disabled={disabled}
          onBeforeHook={this.handleBefore}
          onClientErrorHook={this.handleClientError}
          onServerErrorHook={this.handleServerError}
          onSucessHook={this.handleSucess}
        />
        {disabled && <Loading className="center" />}
        <Alert type="error" content={errorMsg} />
        <Alert type="success" content={successMsg} />
        {view === 'resetPassword' && (
          <p className="center">
            <a href="/forgot-password" onClick={this.changeViewTo('forgotPassword')}>
              Resend reset password link
            </a>
          </p>
        )}
        {view === 'forgotPassword' && (
          <p className="center">
            <a href="/login" onClick={this.changeViewTo('resetPassword')}>
              Reset password
            </a>
          </p>
        )}
      </div>
    );
  }
}

ResetPasswordPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      token: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

// withRouter provides access to history.push()
export default withRouter(ResetPasswordPage);
