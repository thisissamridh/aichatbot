import AddIcon from '@mui/icons-material/Add';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import IconButton from '@mui/joy/IconButton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import axios from 'axios';
import Cookies from 'js-cookie';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next/types';
import { useSession } from 'next-auth/react';
import { ReactElement } from 'react';
import * as React from 'react';

import Admin from '@app/components/Admin';
import SettingsLayout from '@app/components/SettingsLayout';
import UserFree from '@app/components/UserFree';
import UserPremium from '@app/components/UserPremium';

import accountConfig from '@chaindesk/lib/account-config';
import { withAuth } from '@chaindesk/lib/withAuth';
import { Prisma, SubscriptionPlan } from '@chaindesk/prisma';

export default function BillingSettingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleClickManageSubscription = async () => {
    try {
      const { data } = await axios.post('/api/stripe/customer-portal');

      if (data) {
        router.push(data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  React.useEffect(() => {
    function getClientReferenceId() {
      return (
        ((window as any)?.Rewardful && (window as any)?.Rewardful?.referral) ||
        'checkout_' + new Date().getTime()
      );
    }

    (async () => {
      const checkoutSessionId = router.query?.checkout_session_id;

      if (!checkoutSessionId) {
        return;
      }

      try {
        const checkoutDataRes = await axios.post(
          '/api/stripe/get-checkout-session',
          {
            checkoutSessionId,
          }
        );

        const checkoutData = checkoutDataRes.data;

        if (checkoutData) {
          console.debug(checkoutData);
          window?.gtag?.('event', 'purchase', {
            transaction_id: checkoutData.id,
            value: checkoutData.amount_total,
            currency: checkoutData.currency / 100,
          });
        }
      } catch (err) {
        console.log(err);
      }

      let utmParams = {};
      try {
        utmParams = JSON.parse(Cookies.get('utmParams') || '{}');
      } catch {}

      await axios
        .post('/api/stripe/referral', {
          checkoutSessionId,
          referralId: getClientReferenceId(),
          utmParams,
        })
        .catch(console.log);

      delete router.query.checkout_session_id;
      router.replace(router, undefined, { shallow: true });
    })();
  }, []);

  const currentPlan = accountConfig[session?.organization?.currentPlan!];

  if (!session?.organization) {
    return null;
  }

  return (
    <Stack>
      <Head>
        <script
          id="stripe-pricing-table"
          async
          src="https://js.stripe.com/v3/pricing-table.js"
        ></script>
      </Head>

      <Box mb={4}>
        <UserFree>
          <Card variant="outlined" sx={{ bgcolor: 'black' }}>
            <stripe-pricing-table
              pricing-table-id={process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID}
              publishable-key={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
              client-reference-id={session?.organization?.id}
              customer-email={session?.user?.email}
            ></stripe-pricing-table>
          </Card>
        </UserFree>
      </Box>

      <Stack
        gap={4}
        sx={(theme) => ({
          maxWidth: '100%',
          width: theme.breakpoints.values.md,
          mx: 'auto',
        })}
      >
        <FormControl id="plan" sx={{ gap: 1 }}>
          <FormLabel>Current Plan</FormLabel>
          {/* <Typography level="body-xs">
            Use the api key to access the Chaindesk API
          </Typography> */}

          <Card variant="outlined">
            <Typography
              level="h4"
              fontWeight={'bold'}
              color={
                currentPlan?.type === SubscriptionPlan?.level_0
                  ? 'warning'
                  : 'success'
              }
            >{`${currentPlan?.label}`}</Typography>

            <Stack width="100%" spacing={2} my={2}>
              <Divider></Divider>
              <Typography
                level="title-md"
                startDecorator={<CheckRoundedIcon color="success" />}
              >
                <Typography>{`${currentPlan?.limits?.maxAgents} Agents`}</Typography>
              </Typography>
              <Typography
                level="title-md"
                startDecorator={<CheckRoundedIcon color="success" />}
              >
                <Typography>{`${currentPlan?.limits?.maxDatastores} Datastores`}</Typography>
              </Typography>
              {session?.organization?.isPremium ? (
                <Typography
                  level="title-md"
                  startDecorator={<CheckRoundedIcon color="success" />}
                >
                  <Typography>{`${
                    currentPlan?.limits?.maxAgentsQueries
                  } GPT-3.5 or ${
                    currentPlan?.limits?.maxAgentsQueries / 2
                  } GPT-4 Agent responses / month`}</Typography>
                </Typography>
              ) : (
                <Typography
                  level="title-md"
                  startDecorator={<CheckRoundedIcon color="success" />}
                >
                  <Typography>{`${currentPlan?.limits?.maxAgentsQueries} GPT-3.5 responses / month`}</Typography>
                </Typography>
              )}
              <Typography
                level="title-md"
                startDecorator={<CheckRoundedIcon color="success" />}
              >
                <Typography>{`${
                  currentPlan?.limits?.maxStoredTokens / 1000000
                } Million words storage`}</Typography>
              </Typography>
              <Typography
                level="title-md"
                startDecorator={<CheckRoundedIcon color="success" />}
              >
                <Typography>{`${
                  currentPlan?.limits?.maxFileSize / 1000000
                }MB File upload limit`}</Typography>
              </Typography>
              {/* <Typography
                level="title-md"
                startDecorator={<CheckRoundedIcon color="success" />}
              >
                <Typography>{`${currentPlan?.limits?.maxDataProcessing /
                  1000000}MB Data processing (embeddings) / month`}</Typography>
              </Typography> */}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <UserPremium>
              <Admin>
                <Button
                  onClick={handleClickManageSubscription}
                  endDecorator={<ArrowForwardRoundedIcon />}
                  variant="solid"
                  sx={{ ml: 'auto' }}
                  color="warning"
                >
                  Upgrade / Manage Subscription
                </Button>
              </Admin>
            </UserPremium>
          </Card>
        </FormControl>
      </Stack>
    </Stack>
  );
}

BillingSettingsPage.getLayout = function getLayout(page: ReactElement) {
  return <SettingsLayout>{page}</SettingsLayout>;
};

export const getServerSideProps = withAuth(
  async (ctx: GetServerSidePropsContext) => {
    return {
      props: {},
    };
  }
);
