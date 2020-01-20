/** библиотеки */
import React, { useContext, useEffect } from 'react';

/** компоненты */
import { Redirect, Route, Switch, RouteProps } from 'react-router';
import LoginPage from '@components/Login';
import Layout from '@components/Layout';
import InactivityTimerPopup from '@components/InactivityTimerPopup';
import NotFound from '@components/Error/404';
import InternalError from '@components/Error/500';

/** история */
import history from '@history';

/** контексты */
import { AppContext } from '@contexts/AppContext';
import { AuthContext } from '@contexts/AuthContext';

/** константы */
import { TOKEN } from '@constants/common';
import { ActionType } from '@constants/actions';

/** API */
import { cookies } from '@api/api';

/** Маршруты */
import { VoiceEntries } from '@routes/VoiceRoutes';
import { SupportEntries } from '@routes/SupportRoutes';
import { FinanceEntries } from '@routes/FinanceRoutes';
import { SettingsEntries } from '@routes/SettingsRoutes';
import { VteEntries, vteLinks } from '@routes/VteRoutes';

/**
 * Интерфейс маршрута с проверкой 500 ошибки
 */
interface PublicRouteProps extends RouteProps {
  component: any;
}

/**
 * Маршрут с проверкой 500 ошибки
 * @param props параметры
 * @constructor
 */
export const PublicRoute = (props: PublicRouteProps) => {
  const { component: Component, ...rest } = props;
  const { AppState, showInternalServerError } = useContext(AppContext);

  useEffect(() => {
    showInternalServerError({
      type: ActionType.INTERNAL_SERVER_ERROR,
      payload: false,
    });
  }, [history.location.pathname]);

  return (
    <Route
      {...rest}
      render={routeProps => AppState.internalServerError.show ? <InternalError/> :
        <Component {...routeProps} />
      }
    />
  );
};

/**
 * Проверяет наличие токена и 500 ошибку перед рендером компонента. Если токена нет - перенаправляет на авторизацию
 * @param component компонент
 * @param rest остальные параметры
 * @constructor
 */
export const ProtectedRoute = ({ component: Component, ...rest }: any) => {
  const { AppState, showInternalServerError } = useContext(AppContext);

  useEffect(() => {
    showInternalServerError({
      type: ActionType.INTERNAL_SERVER_ERROR,
      payload: false,
    });
  }, [history.location.pathname]);

  return (
    <Route
      {...rest}
      render={props =>
        AppState.internalServerError.show ? <InternalError/> :
        cookies.get(TOKEN) ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
};

/**
 * Создание корректного отображения маршрутов.
 */
export const Routes = () => {
  const { isBundle } = React.useContext(AuthContext);

  const layoutPaths = [
    '/',
    ...Object.keys(VoiceEntries),
    ...Object.keys(SupportEntries),
    ...Object.keys(SettingsEntries),
    ...Object.keys(FinanceEntries),
    ...Object.keys(VteEntries),
  ];
  isBundle && layoutPaths.push('/products');

  return (
    <>
      <Switch>
        <PublicRoute path="/login" component={LoginPage} exact/>
        <ProtectedRoute path={layoutPaths} component={Layout} exact/>
        <PublicRoute component={NotFound}/>
      </Switch>
      <InactivityTimerPopup />
    </>
  );
};
