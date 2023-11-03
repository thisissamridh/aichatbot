import AddIcon from '@mui/icons-material/Add';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Link as JoyLink,
  Typography,
} from '@mui/joy';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetServerSideProps, GetServerSidePropsContext } from 'next/types';
import { useSession } from 'next-auth/react';
import { ReactElement } from 'react';
import * as React from 'react';
import useSWR from 'swr';

import useStateReducer from '@app/hooks/useStateReducer';

import accountConfig from '@chaindesk/lib/account-config';
import { fetcher } from '@chaindesk/lib/swr-fetcher';
import { RouteNames } from '@chaindesk/lib/types';
import { withAuth } from '@chaindesk/lib/withAuth';
import { Prisma } from '@chaindesk/prisma';

import { getDatastores } from '../api/datastores';

const CreateDatastoreModal = dynamic(
  () => import('@app/components/CreateDatastoreModal'),
  {
    ssr: false,
  }
);

export default function DatasourcesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [state, setState] = useStateReducer({
    isCreateDatastoreModalOpen: false,
    isCreateDatasourceModalV2Open: false,
    currentDatastoreId: undefined as string | undefined,
    isUsageModalOpen: false,
  });

  const getDatastoresQuery = useSWR<
    Prisma.PromiseReturnType<typeof getDatastores>
  >('/api/datastores', fetcher);

  const handleClickNewDatastore = () => {
    if (
      (getDatastoresQuery?.data?.length || 0) >=
      accountConfig[session?.organization?.currentPlan!]?.limits?.maxDatastores
    ) {
      setState({ isUsageModalOpen: true });
    } else {
      setState({ isCreateDatastoreModalOpen: true });
    }
  };

  return (
    <Box
      component="main"
      className="MainContent"
      sx={(theme) => ({
        px: {
          xs: 2,
          md: 6,
        },
        pt: {
          // xs: `calc(${theme.spacing(2)} + var(--Header-height))`,
          // sm: `calc(${theme.spacing(2)} + var(--Header-height))`,
          // md: 3,
        },
        pb: {
          xs: 2,
          sm: 2,
          md: 3,
        },
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        // height: '100dvh',
        width: '100%',
        gap: 1,
      })}
    >
      {/* ... other JSX ... */}

      <CreateDatastoreModal
        isOpen={true}  // Always render the modal
        onSubmitSuccess={(datastore) => {
          getDatastoresQuery.mutate();
          // router.push(`/datastores/${datastore.id}`);
        }}
        handleClose={() => {
          // setState({ isCreateDatastoreModalOpen: false });
          alert("Data has been saved")
        }}
      />
    </Box>
  );
}

export const getServerSideProps = withAuth(async (ctx) => {
  return {
    props: {},
  };
});